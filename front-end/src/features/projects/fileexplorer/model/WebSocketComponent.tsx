import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from 'react-router-dom';
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { FileNode, FileType } from "../type/directoryTypes";
import Folder from "../widgets/Folder";
// userContext
import { useProjectEditor } from "../../../../context/ProjectEditorContext";
import { FileTapType, TapManagerType } from "../../../../shared/types/projectApiResponse";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../app/redux/store";
import { fetchUserInfo } from "../../../../app/redux/user";

interface TreeNode {
  id: number;
  name: string;
  type: string;
  children: TreeNode[];
  parent: string;
}

const WebSocketComponent: React.FC = () => {
  const disPatch = useDispatch<AppDispatch>();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [treeData, setTreeData] = useState<FileNode | null>(null);
  const nodesMapRef = useRef(new Map<number, TreeNode>());
  const clientRef = useRef<Client | null>(null);
  const { groupId } = useParams();
  const { projectId } = useParams();
  const url = import.meta.env.VITE_APP_API_BASE_URL;
  const access = localStorage.getItem("accessToken");
  
  const { user, status } = useSelector((state: RootState) => state.user)
  const email = user?.email
  
  useEffect (() => {
    if (!user && status === "idle") {
      disPatch(fetchUserInfo())
    }
  }, [disPatch, user, status])

  const {
    setActiveFile,
    setFileTap,
    fileTap,
    tapManager,
    setTapManager,
    emailToTabs
  } = useProjectEditor();

  const addNewFile = (file: FileTapType) => {
    if (!email) return console.error("사용자 이메일 로드 X");
    
    const newFile = {
      fileName: file.fileName,
      fileRouteAndName: file.fileRouteAndName,
      content: file.content
    }; 
    const userTaps = emailToTabs(email!)
    const newUserTaps = [...userTaps, newFile]
    console.log("추가되는 탭", newUserTaps);
    const userTapManager: TapManagerType | undefined = tapManager.find((tapManager) => tapManager.email === email)
    console.log("유저의 탭 매니저", userTapManager);
    if (userTapManager) {
      const updatedTapManager = tapManager.map((tm) =>
        tm.email === email
          ? { ...tm, Tabs: [...tm.Tabs, newFile] } // newUserTaps[newUserTaps.length - 1] 대신 newFile 사용
          : tm
      );
      setTapManager(updatedTapManager);
      console.log("기존 유저 탭에 추가: ", updatedTapManager);
    } else {
      // 신규 유저 탭 생성: 새로운 항목을 추가
    const newTapManagerEntry: TapManagerType = {
      email,
      activeTap: newFile.fileName,
      Tabs: [newFile],
    };
    setTapManager([...tapManager, newTapManagerEntry]);
    console.log("신규 유저 탭 생성: ", [...tapManager, newTapManagerEntry]);
      
    }
    
    
    

    setFileTap(prevFileTap => {
      if (prevFileTap.some(tapFile => tapFile.fileRouteAndName === newFile.fileRouteAndName)) {
        return prevFileTap;
      }
      setActiveFile(newFile.fileRouteAndName); 
      return [...prevFileTap, newFile];
    });
  };
  
  const idCounter = useRef(1);
  const generateUniqueId = () => {
    idCounter.current += 1;
    return idCounter.current;
  };

  const buildTreeFromMap = useCallback((): FileNode | null => {
    const map = nodesMapRef.current;
    const rootNode = map.get(1);
    if (!rootNode) return null;
    const buildNode = (node: TreeNode): FileNode => ({
      id: node.id,
      name: node.name,
      type: node.type as FileType,
      parent: node.parent,
      children: node.children.map((child) => {
        const childNode = map.get(child.id);
        if (!childNode) throw new Error(`Child node not found: ${child.id}`);
        return buildNode(childNode);
      }),
    });
    return buildNode(rootNode);
  }, []);

  const getNodeByPath = useCallback((path: string): TreeNode | undefined => {
    const nodes = Array.from(nodesMapRef.current.values());
    return nodes.find((node) => {
      if (node.name === "/" && path === "/") return true;
      if ((node.parent === "" || node.parent === "/") && path === `/${node.name}`)
        return true;
      return path === `${node.parent}/${node.name}`;
    });
  }, []);

  const updateNodesMapWithList = useCallback(
    (data: {
      action: string;
      path: string;
      children: { type: string; name: string }[];
    }) => {
      if (data.action !== 'LIST') { // create, delete, rename 요청 완료 후 재렌더링
        sendActionRequest('LIST', { path: data.path });
        return;
      }
      // console.log("Updating nodes map with data:", data);
      const parentNode = getNodeByPath(data.path);
      if (!parentNode) {
        console.error("Parent node not found for path:", data.path);
        return;
      }
      parentNode.children.forEach((child) => {
        nodesMapRef.current.delete(child.id);
      });
      parentNode.children = data.children.map((child) => {
        const newNode: TreeNode = {
          id: generateUniqueId(),
          name: child.name,
          type: child.type,
          children: [],
          parent: data.path,
        };
        nodesMapRef.current.set(newNode.id, newNode);
        return newNode;
      });
      // console.log("Updated nodes map:", Array.from(nodesMapRef.current.entries()));
      setTreeData(buildTreeFromMap());
    },
    [buildTreeFromMap, getNodeByPath]
  );

  const sendActionRequest = useCallback(
    (action: "LIST" | "CREATE" | "DELETE" | "RENAME" | "CONTENT" | "SAVE", payload: any) => {
      if (!clientRef.current || !clientRef.current.connected) {
        console.error("STOMP client is not connected");
        return;
      }
      const destination = `/pub/groups/${groupId}/projects/${projectId}/directory/${action.toLowerCase()}`;
      // console.log("Sending request:", { destination, action, payload });
      clientRef.current.publish({
        destination,
        headers: { Authorization: `Bearer ${access}` },
        body: JSON.stringify({ action, ...payload }),
      });
    },
    [groupId, projectId, access]
  );

  useEffect(() => {
    const initialNode: TreeNode = {
      id: 1,
      name: "/",
      type: "DIRECTORY",
      children: [],
      parent: "",
    };
    nodesMapRef.current.set(1, initialNode);
    setTreeData(buildTreeFromMap());
  }, [buildTreeFromMap]);

  const initialWebSocket = useCallback(() => {
    const socket = new SockJS(`${url}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: {
        Authorization: `Bearer ${access}`,
      },
      onConnect: () => {
        // console.log("WebSocket connected");
        clientRef.current = client;
        const topic = `/sub/groups/${groupId}/projects/${projectId}/directory`;
        client.subscribe(topic, (message) => {
          try {
            const data = JSON.parse(message.body);
            // console.log("Received message:", data);
            if (data.action === "CONTENT") {
              // console.log(`Received ${data.action} message:`, {
              //   action: data.action,
              //   fileName: data.name,
              //   content: data.content,
              //   path: data.path
              // });
              const openFile: FileTapType = {
                fileName:data.name,
                fileRouteAndName:`${data.path}/${data.name}`,
                content: data.content
              }

              addNewFile(openFile);
            } else if(data.action === "SAVE"){
              // console.log(`Received ${data.action} message:`, {
              //   action: data.action,
              //   fileName: data.name,
              //   contentLength: data.content,
              //   path: data.path
              // });
            } else {
              updateNodesMapWithList(data);
            }
          } catch (error) {
            console.error("Error processing message:", error);
          }
        });
        setTimeout(() => {
          sendActionRequest("LIST", { path: "/" });
        }, 500);
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
      },
      onWebSocketClose: () => {
        console.warn("WebSocket connection closed");
        clientRef.current = null;
      },
    });
    client.activate();
  }, [groupId, projectId, access, sendActionRequest, updateNodesMapWithList]);

  const handleNodeSelect = useCallback((nodeId: number) => {
    setSelectedId(nodeId);
  }, []);

  useEffect(() => {
    let isSubscribed = true;
    
    const cleanup = () => {
      isSubscribed = false;
      clientRef.current?.deactivate();
      nodesMapRef.current.clear();
    };
  
    if (isSubscribed) {
      initialWebSocket();
    }
  
    return cleanup;
  }, []);

  // const handleRefresh = () => {
  //   initialWebSocket();
  // };

  const checkDuplicateName = useCallback((path: string, newName: string): boolean => {
    const parentNode = getNodeByPath(path);
    if (!parentNode) return false;
  
    return parentNode.children.some(child => child.name === newName);
  }, [getNodeByPath]);
// 사용자 이메일이 로드된 후에만 WebSocket 연결 시작
useEffect(() => {
  if (email) {
    initialWebSocket();
  }
}, [email, initialWebSocket]);
  return (
    <div className="w-full">
      <div>
        {/* <button onClick={handleRefresh}>새로고침</button> 새로고침 후 3번째 depth 부터 데이터 렌더링이 안 됨*/}
      </div>
      {treeData ? (
        <Folder
          explorerData={treeData}
          selectedId={selectedId}
          sendActionRequest={sendActionRequest}
          handleNodeSelect={handleNodeSelect}
          checkDuplicateName={checkDuplicateName}
        />
      ) : (
        <div>Loading directory data...</div>
      )}
    </div>
  );
};

export default WebSocketComponent;
