import * as monaco from 'monaco-editor';
import Editor, { loader, Monaco } from '@monaco-editor/react';
import { useEffect, useRef } from 'react';
import styles from './textEditor.module.scss';
import axios from 'axios';
import { logger } from '../../../utils/logger';

// 语法高亮文件
import { editorLineHolder, lspSceneName, WG_ORIGINE_RUNTIME } from '../../../runtime/WG_ORIGINE_RUNTIME';
import { WsUtil } from '../../../utils/wsUtil';
import { eventBus } from '@/utils/eventBus';
import useEditorStore from '@/store/useEditorStore';
import { useGameEditorContext } from '@/store/useGameEditorStore';

interface ITextEditorProps {
  targetPath: string;
  isHide: boolean;
}

let isAfterMount = false;

export default function TextEditor(props: ITextEditorProps) {
  const target = useGameEditorContext((state) => state.currentTag);
  const tags = useGameEditorContext((state) => state.tags);
  const gameName = useEditorStore.use.subPage();
  // const currentText = useValue<string>("Loading Scene Data......");
  const currentText = { value: 'Loading Scene Data......' };
  const sceneName = tags.find((e) => e.path === target?.path)!.name;
  const isAutoWarp = useEditorStore.use.isAutoWarp();

  // 准备获取 Monaco
  // 建立 Ref
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  loader.config({ monaco });

  /**
   * 处理挂载事件
   * @param {any} editor
   * @param {any} monaco
   */
  function handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) {
    logger.debug('脚本编辑器挂载');
    lspSceneName.value = sceneName;
    editorRef.current = editor;
    editor.onDidChangeCursorPosition((event) => {
      const lineNumber = event.position.lineNumber;
      const editorValue = editor.getValue();
      const targetValue = editorValue.split('\n')[lineNumber - 1];
      // const trueLineNumber = getTrueLinenumber(lineNumber, editorRef.current?.getValue()??'');
      const sceneName = tags.find((e) => e.path === target?.path)!.name;
      if (!isAfterMount) {
        editorLineHolder.recordSceneEdittingLine(props.targetPath, lineNumber);
      }
      WsUtil.sendSyncCommand(sceneName, lineNumber, targetValue);
    });
    editor.updateOptions({ unicodeHighlight: { ambiguousCharacters: false }, wordWrap: isAutoWarp ? 'on' : 'off' });
    isAfterMount = true;
    updateEditData();
  }

  useEffect(() => {
    editorRef?.current?.updateOptions?.({ wordWrap: isAutoWarp ? 'on' : 'off' });
  }, [isAutoWarp]);

  /**
   * handle monaco change
   * @param {string} value
   * @param {any} ev
   */
  function handleChange(value: string | undefined, ev: monaco.editor.IModelContentChangedEvent) {
    logger.debug('编辑器提交更新');
    const lineNumber = ev.changes[0].range.startLineNumber;
    if (!isAfterMount) {
      editorLineHolder.recordSceneEdittingLine(props.targetPath, lineNumber);
    }

    // const trueLineNumber = getTrueLinenumber(lineNumber, value ?? "");
    if (value) currentText.value = value;
    const params = new URLSearchParams();
    params.append('gameName', gameName);
    params.append('sceneName', sceneName);
    params.append('sceneData', JSON.stringify({ value: currentText.value }));
    eventBus.emit('update-scene', currentText.value);
    axios.post('/api/manageGame/editScene/', params).then((res) => {
      const targetValue = currentText.value.split('\n')[lineNumber - 1];
      WsUtil.sendSyncCommand(sceneName, lineNumber, targetValue);
    });
  }

  function updateEditData() {
    const currentEditName = tags.find((e) => e.path === target?.path)!.name;
    const url = `/games/${gameName}/game/scene/${currentEditName}`;
    axios
      .get(url)
      .then((res) => res.data)
      .then((data) => {
        // currentText.set(data);
        currentText.value = data.toString();
        eventBus.emit('update-scene', data.toString());
        editorRef.current?.getModel()?.setValue(currentText.value);
        if (isAfterMount) {
          const targetLine = editorLineHolder.getSceneLine(props.targetPath);
          editorRef?.current?.setPosition({ lineNumber: targetLine, column: 0 });
          editorRef?.current?.revealLineInCenter(targetLine, 0);
          isAfterMount = false;
        }
      });
  }

  return (
    <div
      style={{ display: props.isHide ? 'none' : 'block', zIndex: 999, overflow: 'auto' }}
      className={styles.textEditor_main}
    >
      <Editor
        height="100%"
        width="100%"
        onMount={handleEditorDidMount}
        onChange={handleChange}
        defaultLanguage="webgal"
        language="webgal"
        defaultValue={currentText.value}
      />
    </div>
  );
}
