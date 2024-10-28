import CommonOptions from "../components/CommonOption";
import {ISentenceEditorProps} from "./index";
import styles from "./sentenceEditor.module.scss";
import ChooseFile from "../../ChooseFile/ChooseFile";
import {useValue} from "../../../../hooks/useValue";
import {getArgByKey} from "../utils/getArgByKey";
import TerreToggle from "../../../../components/terreToggle/TerreToggle";
import {useEffect, useState} from "react";
import {EffectEditor} from "@/pages/editor/GraphicalEditor/components/EffectEditor";
import CommonTips from "@/pages/editor/GraphicalEditor/components/CommonTips";
import axios from "axios";
import {TerrePanel} from "@/pages/editor/GraphicalEditor/components/TerrePanel";
import {Button, Dropdown, Input, Option} from "@fluentui/react-components";
import useEditorStore from "@/store/useEditorStore";
import {t} from "@lingui/macro";

type FigurePosition = "" | "left" | "right";
type AnimationFlag = "" | "on";

export default function ChangeFigure(props: ISentenceEditorProps) {
  const currentEdit = useEditorStore.use.subPage();
  const updateExpand = useEditorStore.use.updateExpand();
  const gameName = currentEdit;
  const isGoNext = useValue(!!getArgByKey(props.sentence, "next"));
  const figureFile = useValue(props.sentence.content);
  const figurePosition = useValue<FigurePosition>("");
  const isNoFile = props.sentence.content === "";
  const id = useValue(getArgByKey(props.sentence, "id").toString() ?? "");
  const json = useValue<string>(getArgByKey(props.sentence, 'transform') as string);
  const duration = useValue<number | string>(getArgByKey(props.sentence, 'duration') as number);
  const mouthOpen = useValue(getArgByKey(props.sentence, "mouthOpen").toString() ?? "");
  const mouthHalfOpen = useValue(getArgByKey(props.sentence, "mouthHalfOpen").toString() ?? "");
  const mouthClose = useValue(getArgByKey(props.sentence, "mouthClose").toString() ?? "");
  const eyesOpen = useValue(getArgByKey(props.sentence, "eyesOpen").toString() ?? "");
  const eyesClose = useValue(getArgByKey(props.sentence, "eyesClose").toString() ?? "");
  const animationFlag = useValue(getArgByKey(props.sentence, "animationFlag").toString() ?? "");
  const bounds = useValue(getArgByKey(props.sentence, "bounds").toString() ?? "");
  const zIndex = useValue(String(getArgByKey(props.sentence, 'zIndex') ?? ''));
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [l2dMotionsList, setL2dMotionsList] = useState<string[]>([]);
  const [l2dExpressionsList, setL2dExpressionsList] = useState<string[]>([]);

  const currentMotion = useValue(getArgByKey(props.sentence, "motion").toString() ?? "");
  const currentExpression = useValue(
    getArgByKey(props.sentence, "expression").toString() ?? ""
  );

  const figurePositions = new Map<FigurePosition, string>([
    ["", t`中间`],
    ["left", t`左侧`],
    ["right", t`右侧`]
  ]);

  const animationFlags = new Map<AnimationFlag, string>([
    ["", "OFF"],
    ["on", "ON"],
  ]);

  useEffect(() => {
    if (figureFile.value.includes('json')) {
      console.log('loading JSON file to get motion and expression');
      axios.get(`/games/${gameName}/game/figure/${figureFile.value}`).then(resp => {
        const data = resp.data;

        if (data?.motions) {
          // 处理 motions
          const motions = Object.keys(data.motions);
          setL2dMotionsList(motions.sort((a, b) => a.localeCompare(b)));
        }

        // 处理 expressions
        if (data?.expressions) {
          const expressions: string[] = data.expressions.map((exp: { name: string }) => exp.name);
          setL2dExpressionsList(expressions.sort((a, b) => a.localeCompare(b)));
        }

        // 处理 v3 版本的 model
        if (data?.['FileReferences']?.['Motions']) {
          const motions = Object.keys(data['FileReferences']['Motions']);
          setL2dMotionsList(motions.sort((a, b) => a.localeCompare(b)));
        }

        if (data?.['FileReferences']?.['Expressions']) {
          const expressions: string[] = data['FileReferences']['Expressions'].map((exp: { Name: string }) => exp.Name);
          setL2dExpressionsList(expressions.sort((a, b) => a.localeCompare(b)));
        }

      });
    }
  }, [figureFile.value]);
  const toggleAccordion = () => {
    setIsAccordionOpen(!isAccordionOpen);
  };
  const optionButtonStyles = {
    root: {
      margin: '6px 0 0 0',
      display: 'flex'
    },
  };
  useEffect(() => {
    /**
     * 初始化立绘位置
     */
    if (getArgByKey(props.sentence, "left")) {
      figurePosition.set("left");
    }
    if (getArgByKey(props.sentence, "right")) {
      figurePosition.set("right");
    }
  }, []);
  useEffect(() => {
    if (animationFlag.value === "on") {
      setIsAccordionOpen(true);
    } else {
      setIsAccordionOpen(false);
    }
  }, [animationFlag.value]);
  const submit = () => {
    const isGoNextStr = isGoNext.value ? " -next" : "";
    const pos = figurePosition.value !== "" ? ` -${figurePosition.value}` : "";
    const idStr = id.value !== "" ? ` -id=${id.value}` : "";
    const durationStr = duration.value === "" ? '' : ` -duration=${duration.value}`;
    const transformStr = json.value === "" || json.value === "{}" ? '' : ` -transform=${json.value}`;
    const animationStr = animationFlag.value !== "" ? ` -animationFlag=${animationFlag.value}` : "";
    const mouthOpenFile = mouthOpen.value !== "" ? ` -mouthOpen=${mouthOpen.value}` : "";
    const mouthHalfOpenFile = mouthHalfOpen.value !== "" ? ` -mouthHalfOpen=${mouthHalfOpen.value}` : "";
    const mouthCloseFile = mouthClose.value !== "" ? ` -mouthClose=${mouthClose.value}` : "";
    const eyesOpenFile = eyesOpen.value !== "" ? ` -eyesOpen=${eyesOpen.value}` : "";
    const eyesCloseFile = eyesClose.value !== "" ? ` -eyesClose=${eyesClose.value}` : "";
    const motionArgs = currentMotion.value !== '' ? ` -motion=${currentMotion.value}` : "";
    const expressionArgs = currentExpression.value !== '' ? ` -expression=${currentExpression.value}` : "";
    const boundsArgs = bounds.value !== '' ? ` -bounds=${bounds.value}` : "";
    const zIndexArgs = zIndex.value !== '' ? ` -zIndex=${zIndex.value}` : "";

    if (animationFlag.value === "") {
      props.onSubmit(`changeFigure:${figureFile.value}${pos}${idStr}${transformStr}${durationStr}${isGoNextStr}${motionArgs}${expressionArgs}${boundsArgs}${zIndexArgs};`);
    } else {
      props.onSubmit(`changeFigure:${figureFile.value}${pos}${idStr}${transformStr}${durationStr}${isGoNextStr}${animationStr}${eyesOpenFile}${eyesCloseFile}${mouthOpenFile}${mouthHalfOpenFile}${mouthCloseFile}${motionArgs}${expressionArgs}${boundsArgs}${zIndexArgs};`);
    }
  };

  return <div className={styles.sentenceEditorContent}>
    <div className={styles.editItem}>
      <CommonOptions key="isNoDialog" title={t`关闭立绘`}>
        <TerreToggle title="" onChange={(newValue) => {
          if (!newValue) {
            figureFile.set(t`选择立绘文件`);
          } else
            figureFile.set("none");
          submit();
        }} onText={t`关闭立绘`} offText={t`显示立绘`} isChecked={isNoFile}/>
      </CommonOptions>
      {!isNoFile &&
        <CommonOptions key="1" title={t`立绘文件`}>
          <>
            {figureFile.value + "\u00a0\u00a0"}
            <ChooseFile sourceBase="figure" onChange={(fileDesc) => {
              figureFile.set(fileDesc?.name ?? "");
              submit();
            }}
            extName={[".png", ".jpg", ".webp", ".json"]}/>
          </>
        </CommonOptions>}
      <CommonOptions key="2" title={t`连续执行`}>
        <TerreToggle title="" onChange={(newValue) => {
          isGoNext.set(newValue);
          submit();
        }} onText={t`本句执行后执行下一句`}
        offText={t`本句执行后等待`} isChecked={isGoNext.value}/>
      </CommonOptions>
      <CommonOptions title={t`z-index`} key="z-index">
        <input value={zIndex.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            zIndex.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder={t`1, 2, 3, ...`}
          style={{width: "100%"}}
        />
      </CommonOptions>
      {figureFile.value.includes('.json') && (
        <>
          <CommonOptions key="24" title="live2D Motion">
            <Dropdown
              value={currentMotion.value}
              selectedOptions={[currentMotion.value]}
              onOptionSelect={(ev, data) => {
                data.optionValue && currentMotion.set(data.optionValue);
                submit();
              }}
              style={{minWidth: 0}}
            >
              {l2dMotionsList.map(e => (<Option key={e} value={e}>{e}</Option>))}
            </Dropdown>
          </CommonOptions>

          <CommonOptions key="25" title="live2D Expression">
            <Dropdown
              value={currentExpression.value}
              selectedOptions={[currentExpression.value]}
              onOptionSelect={(ev, data) => {
                data.optionValue && currentExpression.set(data.optionValue);
                submit();
              }}
              style={{minWidth: 0}}
            >
              {l2dExpressionsList.map(e => (<Option key={e} value={e}>{e}</Option>))}
            </Dropdown>
          </CommonOptions>
          <CommonOptions title={t`自定义 Live2D 绘制范围`} key="bounds">
            <input value={bounds.value}
              onChange={(ev) => {
                const newValue = ev.target.value;
                bounds.set(newValue ?? "");
              }}
              onBlur={submit}
              className={styles.sayInput}
              placeholder={t`例如：-100,-100,100,100`}
              style={{width: "100%"}}
            />
          </CommonOptions>
        </>
      )}

      <CommonOptions title={t`立绘位置`} key="3">
        <Dropdown
          value={figurePositions.get(figurePosition.value) ?? figurePosition.value}
          selectedOptions={[figurePosition.value]}
          onOptionSelect={(ev, data) => {
            figurePosition.set(data.optionValue?.toString() as FigurePosition ?? "");
            submit();
          }}
          style={{minWidth: 0}}
        >
          {Array.from(figurePositions.entries()).map(([key, value]) => <Option key={key} value={key}>{value}</Option>)}
        </Dropdown>
      </CommonOptions>
      <CommonOptions title={t`立绘ID（可选）`} key="4">
        <input value={id.value}
          onChange={(ev) => {
            const newValue = ev.target.value;
            id.set(newValue ?? "");
          }}
          onBlur={submit}
          className={styles.sayInput}
          placeholder={t`立绘 ID`}
          style={{width: "100%"}}
        />
      </CommonOptions>
      <CommonOptions key="23" title={t`显示效果`}>
        <Button onClick={() => {
          updateExpand(props.index);
        }}>{t`打开效果编辑器`}</Button>
      </CommonOptions>
      <TerrePanel
        title={t`效果编辑器`}
        sentenceIndex={props.index}
      >
        <div>
          <CommonTips
            text={t`效果提示`}/>
          <EffectEditor json={json.value.toString()} onChange={(newJson) => {
            json.set(newJson);
            submit();
          }}/>
          <CommonOptions key="10" title={t`持续时间（单位为毫秒）`}>
            <div>
              <Input placeholder={t`持续时间（单位为毫秒）`} value={duration.value.toString()} onChange={(_, data) => {
                const newDuration = Number(data.value);
                if (isNaN(newDuration) || data.value === '')
                  duration.set("");
                else
                  duration.set(newDuration);
              }} onBlur={submit}/>
            </div>
          </CommonOptions>
        </div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          width: animationFlag.value !== "on" ? 'auto' : '100%'
        }}>
          <CommonOptions title={t`唇形同步与眨眼`} key="5">
            <Dropdown
              value={animationFlags.get(animationFlag.value as AnimationFlag)}
              selectedOptions={[animationFlag.value]}
              onOptionSelect={(ev, data) => {
                animationFlag.set(data.optionValue?.toString() ?? "");
                submit();
              }}
              style={{minWidth: 0}}
            >
              {Array.from(animationFlags.entries()).map(([key, value]) => <Option key={key}
                value={key}>{value}</Option>)}
            </Dropdown>
          </CommonOptions>
          {animationFlag.value === "on" &&
            <CommonOptions key="6" title={t`张开嘴`}>
              <>
                {mouthOpen.value + "\u00a0\u00a0"}
                <ChooseFile sourceBase="figure" onChange={(fileDesc) => {
                  mouthOpen.set(fileDesc?.name ?? "");
                  submit();
                }}
                extName={[".png", ".jpg", ".webp"]}/>
              </>
            </CommonOptions>}
          {animationFlag.value === "on" &&
            <CommonOptions key="7" title={t`半张嘴`}>
              <>
                {mouthHalfOpen.value + "\u00a0\u00a0"}
                <ChooseFile sourceBase="figure" onChange={(fileDesc) => {
                  mouthHalfOpen.set(fileDesc?.name ?? "");
                  submit();
                }}
                extName={[".png", ".jpg", ".webp"]}/>
              </>
            </CommonOptions>}
          {animationFlag.value === "on" &&
            <CommonOptions key="8" title={t`闭上嘴`}>
              <>
                {mouthClose.value + "\u00a0\u00a0"}
                <ChooseFile sourceBase="figure" onChange={(fileDesc) => {
                  mouthClose.set(fileDesc?.name ?? "");
                  submit();
                }}
                extName={[".png", ".jpg", ".webp"]}/>
              </>
            </CommonOptions>}
          {animationFlag.value === "on" && <CommonOptions key="9" title={t`睁开眼睛`}>
            <>
              {eyesOpen.value + "\u00a0\u00a0"}
              <ChooseFile sourceBase="figure" onChange={(fileDesc) => {
                eyesOpen.set(fileDesc?.name ?? "");
                submit();
              }}
              extName={[".png", ".jpg", ".webp"]}/>
            </>
          </CommonOptions>}
          {animationFlag.value === "on" && <CommonOptions key="10" title={t`闭上眼睛`}>
            <>
              {eyesClose.value + "\u00a0\u00a0"}
              <ChooseFile sourceBase="figure" onChange={(fileDesc) => {
                eyesClose.set(fileDesc?.name ?? "");
                submit();
              }}
              extName={[".png", ".jpg", ".webp"]}/>
            </>
          </CommonOptions>}
        </div>
      </TerrePanel>

    </div>
  </div>;
}
