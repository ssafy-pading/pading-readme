import { FileNode, FileType } from "../type/directoryTypes";

const useTraverseTree = () => {
  function createNode(
    tree: FileNode,
    id: number,
    name: string,
    type: FileType
  ) {
    if (tree.id === id && tree.type == "FOLDER") {
      const newNode: FileNode = {
        id: new Date().getTime(),
        name: name,
        type: type,
        children: [],
      };
      tree.children = tree.children ? [newNode, ...tree.children] : [newNode];
      return tree;
    }

    if (tree.children) {
      for (let i = 0; i < tree.children.length; i++) {
        const updatedChild = createNode(tree.children[i], id, name, type);
        if (updatedChild !== tree.children[i]) {
          tree.children[i] = updatedChild;
          return tree;
        }
      }
    }
    return tree;
  }

  function renameNode(tree: FileNode, id: number, name: string) {
    if (tree.id === id) {
      // Node found, update its properties
      return {
        ...tree,
        name: name,
      };
    }

    if (tree.children && tree.children.length > 0) {
      tree.children = tree.children.map((child) => renameNode(child, id, name));
    }

    return { ...tree };
  }

  function sortNodes(node: FileNode): FileNode {
    if (!node.children) {
      return node;
    }

    const sortedChildren = [...node.children].sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === "FOLDER" ? -1 : 1;
    });

    return {
      ...node,
      children: sortedChildren.map(sortNodes),
    };
  }
  
  // 올바른 삭제 로직 예시 (재귀적 노드 탐색)
const deleteNode = (tree: FileNode, id: number): FileNode | null => {
  if (tree.id === id) return null;
  if (!tree.children) return tree;
  
  return {
    ...tree,
    children: tree.children
      .map(child => deleteNode(child, id))
      .filter(Boolean) as FileNode[]
  };
};

  return { createNode, deleteNode, renameNode, sortNodes };
};

export default useTraverseTree;
