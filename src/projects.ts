export type Project = {
  name: string;
  description: string;
  url: string;
};

/** Add a project here and it shows up in the list. */
export const projects: Project[] = [
  {
    name: "hangs",
    description: "more connection, less coordination.",
    url: "https://hangs.goodstuffstudio.xyz",
  },
  {
    name: "todo",
    description: "more clarity, less mental clutter.",
    url: "https://todo.goodstuffstudio.xyz",
  },
  {
    name: "dropin",
    description: "more movement, less searching.",
    url: "https://dropin.goodstuffstudio.xyz",
  },
];
