import React, { useEffect, useState, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { useParams } from 'react-router-dom';
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { FileNode, FileType, RefreshWebSocket, Payload, PayloadAction } from "../type/directoryTypes";
import Folder from "../widgets/Folder";
// userContext
import { useProjectEditor } from "../../../../context/ProjectEditorContext";
import { FileTabType, TabManagerType } from "../../../../shared/types/projectApiResponse";

interface TreeNode {
  id: number;
  name: string;
  type: string;
  children: TreeNode[];
  parent: string;
}

const WebSocketComponent = forwardRef<RefreshWebSocket>((_, ref) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [treeData, setTreeData] = useState<FileNode | null>(null);
  const nodesMapRef = useRef(new Map<number, TreeNode>());
  const clientRef = useRef<Client | null>(null);
  const { groupId } = useParams();
  const { projectId } = useParams();
  const url = import.meta.env.VITE_APP_API_BASE_URL;
  const access = localStorage.getItem("accessToken");
  const {
    tabManager,
    setTabManager,
  } = useProjectEditor();

  const addNewFile = (file: FileTabType) => {
    const newFile = {
      fileName: file.fileName,
      fileRouteAndName: file.fileRouteAndName,
      fileRoute: file.fileRoute,
      content: file.content
    };
  
    const email = localStorage.getItem("email");
    if (!email) return console.error("이메일이 없습니다.");
  
    console.log("전체 TMS: ", tabManager);
  
    setTabManager((prev) => {
      const userTabManager = prev.find((tm) => tm.email === email);
  
      if (userTabManager) {
        console.log("기존 TM 수정 전: ", userTabManager);
  
        // 기존 사용자 -> tabs 배열에 새 파일 추가
        return prev.map((tm) =>
          tm.email === email
            ? { ...tm, tabs: [...tm.tabs, newFile], activeTab: newFile.fileRouteAndName }
            : tm
        );
      } else {
        console.log("TM 신규 생성");
  
        // 새로운 사용자 -> 새로운 TabManager 객체 생성
        return [
          ...prev,
          {
            email: email,
            activeTab: newFile.fileRouteAndName,
            tabs: [newFile],
          },
        ];
      }
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

  const sendActionRequest = useCallback(
    (action: PayloadAction, payload: Payload) => {
      if (!clientRef.current?.connected) {
        console.error("STOMP client is not connected");
        return;
      }
      const destination = `/pub/groups/${groupId}/projects/${projectId}/directory/${action.toLowerCase()}`;
      clientRef.current.publish({
        destination,
        headers: { Authorization: `Bearer ${access}` },
        body: JSON.stringify({ action, ...payload }),
      });
    },
    [groupId, projectId, access]
  );

  const updateNodesMapWithList = useCallback(
    (data: {
      action: string;
      path: string;
      children: { type: string; name: string }[];
    }) => {
      if (data.action !== 'LIST') {
        sendActionRequest('LIST', { path: data.path });
        return;
      }

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

      setTreeData(buildTreeFromMap());
    }, [buildTreeFromMap, getNodeByPath, sendActionRequest]
  );

  const initializeWebSocket = useCallback(() => {
    const socket = new SockJS(`${url}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: { Authorization: `Bearer ${access}` },
      onConnect: () => {
        clientRef.current = client;
        const topic = `/sub/groups/${groupId}/projects/${projectId}/directory`;

        client.subscribe(topic, (message) => {
          try {
            const data = JSON.parse(message.body);
            if (data.action === "CONTENT") {
              addNewFile({
                fileName: data.name,
                fileRouteAndName: `${data.path}/${data.name}`,
                fileRoute: data.path,
                content: data.content
              });
            } else if (data.action !== "SAVE") {
              updateNodesMapWithList(data);
            }
          } catch (error) {
            console.error("Error processing message:", error);
          }
        });
        sendActionRequest("LIST", { path: "/" });
      },
      onStompError: (frame) => console.error("STOMP error:", frame.headers["message"]),
      onWebSocketClose: () => {
        console.warn("WebSocket connection closed");
        clientRef.current = null;
      },
    });

    client.activate();
    return client;
  }, [access, groupId, projectId]);

  // 탐색기 데이터 초기화 
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
    // setSendActionRequest(sendActionRequest);

    const client = initializeWebSocket();

    return () => {
      client.deactivate();
      nodesMapRef.current.clear();
    };
  }, [buildTreeFromMap, initializeWebSocket]); // setSendActionRequest, 

  // RefreshWebSocket implementation
  const refreshWebSocket = useCallback(() => {
    if (clientRef.current?.connected) {
      clientRef.current.deactivate();
    }

    nodesMapRef.current.clear();
    nodesMapRef.current.set(1, {
      id: 1,
      name: "/",
      type: "DIRECTORY",
      children: [],
      parent: "",
    });

    setTreeData(buildTreeFromMap());
    initializeWebSocket();
  }, [buildTreeFromMap, initializeWebSocket]);

  useImperativeHandle(ref, () => ({
    refreshWebSocket
  }));

  const handleNodeSelect = useCallback((nodeId: number) => {
    setSelectedId(nodeId);
  }, []);

  const checkDuplicateName = useCallback((path: string, newName: string): boolean => {
    const parentNode = getNodeByPath(path);
    return parentNode ? parentNode.children.some(child => child.name === newName) : false;
  }, []);

  return (
    <div className="w-full">
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
});

export default WebSocketComponent;
