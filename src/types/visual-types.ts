import type { Dispatch, SetStateAction } from "react";

interface AudioFileURL {
  fileURL: string;
  setFileURL: Dispatch<SetStateAction<string>>
}

interface VisualizerState {
  visualize: boolean;
  setVisualize: Dispatch<SetStateAction<boolean>>
}

export type { AudioFileURL, VisualizerState };