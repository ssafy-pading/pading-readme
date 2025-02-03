import { FileNode } from "../type/directoryTypes";

export type FileType = "FILE" | "FOLDER";

export const dummyFileSystem: FileNode = {
  id: 1,
  name: "Root",
  type: "FOLDER",
  children: [
    {
      id: 2,
      name: "Documents",
      type: "FOLDER",
      children: [
        {
          id: 3,
          name: "Work",
          type: "FOLDER",
          children: [
            { id: 4, name: "Project1.docx", type: "FILE" },
            { id: 5, name: "Project2.xlsx", type: "FILE" },
          ]
        },
        {
          id: 6,
          name: "Personal",
          type: "FOLDER",
          children: [
            { id: 7, name: "Resume.pdf", type: "FILE" },
            { id: 8, name: "BudgetPlan.xlsx", type: "FILE" },
          ]
        },
      ]
    },
    {
      id: 9,
      name: "Pictures",
      type: "FOLDER",
      children: [
        { id: 10, name: "Vacation.jpg", type: "FILE" },
        { id: 11, name: "Family.png", type: "FILE" },
      ]
    },
    {
      id: 12,
      name: "Music",
      type: "FOLDER",
      children: [
        { id: 13, name: "Favorites", type: "FOLDER", children: [] },
        { id: 14, name: "Song1.mp3", type: "FILE" },
        { id: 15, name: "Song2.mp3", type: "FILE" },
      ]
    },
  ]
};



// const folderData = {
//   id: "1",
//   name: "root",
//   isFolder: true,
//   items: [
//     {
//       id: "2",
//       name: "public",
//       isFolder: true,
//       items: [
//         {
//           id: "3",
//           name: "index.html",
//           isFolder: false,
//           items: [],
//         },
//         {
//           id: "4",
//           name: "hello.html",
//           isFolder: false,
//           items: [],
//         },
//       ],
//     },
//     {
//       id: "7",
//       name: "src",
//       isFolder: true,
//       items: [
//         {
//           id: "8",
//           name: "App.js",
//           isFolder: false,
//           items: [],
//         },
//         {
//           id: "9",
//           name: "Index.js",
//           isFolder: false,
//           items: [],
//         },
//         {
//           id: "10",
//           name: "styles.css",
//           isFolder: false,
//           items: [],
//         },
//       ],
//     },
//     {
//       id: "11",
//       name: "package.json",
//       isFolder: false,
//       items: [],
//     },
//   ],
// };

// export default folderData;
