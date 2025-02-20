export type PayloadAction = "LIST" | "CREATE" | "DELETE" | "RENAME" | "CONTENT" | "SAVE";

export type FileType = "FILE" | "DIRECTORY" | null;

export interface FileNode {
  id: number;
  name: string;
  parent: string;
  children: FileNode[];
  type: FileType;
}

export interface ListPayload {
  action: "LIST";
  path: string;
  children: FileNode[];
}

export interface CreatePayload {
  action: "CREATE";
  type: FileType;
  name: string;
  path: string;
}

export interface DeletePayload {
  action: "DELETE";
  type: FileType;
  name: string;
  path: string;
}

export interface RenamePayload {
  action: "RENAME";
  type: FileType;
  oldName: string;
  newName: string;
  path: string;
}

export interface Payload {
  action?: PayloadAction;
  type?: FileType;
  path: string;
  name?: string;
  oldName?: string;
  newName?: string;
  content?: string;
}

export interface RefreshWebSocket {
  refreshWebSocket: ()=>void;
}