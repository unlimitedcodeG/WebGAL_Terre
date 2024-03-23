import { ITemplateEditorAction, ITemplateEditorState } from "@/types/templateEditor";
import { createContext, useContext } from "react";
import { StoreApi, create, useStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const initState: ITemplateEditorState = {
  currentTopbarTab: 'config',
  isCodeMode: false,
  isShowDebugger: false,
  sidebarWidth: 280,
  componentTreeHeight: 400,
  editorHeight: 400,
};

export const createTemplateEditorStore = (templateName: string) =>
  create<ITemplateEditorState & ITemplateEditorAction>()(
    persist(
      (set) => ({
        ...initState,
        updateCurrentTopbarTab: (currentTopbarTab) => set({ currentTopbarTab }),
        updateIsCodeMode: (isCodeMode) => set({ isCodeMode }),
        updateIsShowDebugger: (isShowDebugger) => set({ isShowDebugger }),
        updateSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
        updateComponentTreeHeight: (componentTreeHeight) => set({ componentTreeHeight }),
        updateEditorHeight: (editorHeight) => set({editorHeight}),
      }),
      {
        name: `template-editor-storage-${templateName}`,
        storage: createJSONStorage(() => localStorage),
      },
    )
  );

export const TemplateEditorContext = createContext<StoreApi<ITemplateEditorState & ITemplateEditorAction> | null>(null);

export const useTemplateEditorContext = <T>(selector: (state: ITemplateEditorState & ITemplateEditorAction) => T): T => {
  const store = useContext(TemplateEditorContext);
  if (!store) throw new Error('Missing TemplateEditorContext.Provider in the tree');
  return useStore(store, selector);
};