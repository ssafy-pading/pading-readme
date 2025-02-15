// 웹 소켓 send action의 type
export type PayloadAction = "LIST" | "CREATE" | "DELETE" | "RENAME";

export type FileType = "FILE" | "FOLDER";

// payload 내부 파일 구조의 type
export interface FileNode {
    id: number;
    name: string;
    type: FileType;
    children?: FileNode[];
}

// payload의 공통 타입
export interface PayloadBase{
    action: PayloadAction;
    path: string;
}

/* payload 공통 타입을 상속받은 리스트, 생성, 이름 변경, 삭제 타입 */
// 리스트
export interface ListPayload extends PayloadBase {
    action: "LIST";
    children: FileNode[];
}

// 생성
export interface CreatePayload extends PayloadBase {
    action: "CREATE";
    type: FileType;
    name: string;
}

// 삭제
export interface DeletePayload extends PayloadBase {
    action: "DELETE";
    type: FileType;
    name: string;
}

// 이름 변경
export interface RenamePayload extends PayloadBase {
    action: "RENAME";
    type: FileType;
    oldName: string;
    newName: string;
}

export interface DragItem {
    id: number;
    type: 'FILE' | 'FOLDER';
    parentId?: number; // 추가: 상위 폴더 추적용
  }
