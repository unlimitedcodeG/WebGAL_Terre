import { api } from "@/api";
import { useValue } from "@/hooks/useValue";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import styles from "./Assets.module.scss";
import { Badge, Button, Input, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger, Popover, PopoverSurface, PopoverTrigger, Text } from "@fluentui/react-components";
import { ArrowExportUpFilled, ArrowExportUpRegular, ArrowLeftFilled, ArrowLeftRegular, ArrowSyncFilled, ArrowSyncRegular, DocumentAddFilled, DocumentAddRegular, FolderAddFilled, FolderAddRegular, FolderOpenFilled, FolderOpenRegular, MoreVerticalFilled, MoreVerticalRegular, bundleIcon } from "@fluentui/react-icons";
import useTrans from "@/hooks/useTrans";
import FileElement from "./FileElement";
import axios from "axios";
import { dirNameToExtNameMap } from "@/pages/editor/ChooseFile/chooseFileConfig";

export interface IFile {
  extName: string;
  isDir: boolean;
  name: string;
  path: string;
}

export type FolderType = 'animation' | 'background' | 'bgm' | 'figure' | 'scene' | 'tex' | 'video' | 'vocal'

export type FileConfig = Map<
string,
{
  name?: string,
  folderType?: FolderType,
  isProtected?: boolean,
}
>

const ArrowLeftIcon = bundleIcon(ArrowLeftFilled, ArrowLeftRegular);
const DocumentAddIcon = bundleIcon(DocumentAddFilled, DocumentAddRegular);
const FolderAddIcon = bundleIcon(FolderAddFilled, FolderAddRegular);
const FolderOpenIcon = bundleIcon(FolderOpenFilled, FolderOpenRegular);
const MoreVerticalIcon = bundleIcon(MoreVerticalFilled, MoreVerticalRegular);
const ArrowExportUpIcon = bundleIcon(ArrowExportUpFilled, ArrowExportUpRegular);
const ArrowSyncIcon = bundleIcon(ArrowSyncFilled, ArrowSyncRegular);

export default function Assets({basePath, fileConfig}: {basePath: string[], fileConfig?: FileConfig}) {
  const t = useTrans();

  const currentPath = useValue(basePath);
  const currentPathString = useMemo(() => currentPath.value.join("/"), [currentPath]);
  const isBasePath = (currentPathString === basePath.join('/'));
  const fileList = useValue<IFile[] | null>(null);
  const refresh = useValue(false);
  const folderType = useValue<FolderType | undefined>(undefined);
  const supportedExtName = folderType.value ? dirNameToExtNameMap.get(folderType.value) : [];

  useEffect(
    () => {
      fileConfig?.forEach((value, key) => {
        if (currentPathString.startsWith(key)) {
          folderType.set(value.folderType);
        }
      });
      return () => folderType.set(undefined);
    },
    [currentPathString]
  );

  useEffect(
    () => {
      api.assetsControllerReadAssets(currentPathString).then((res) => {
        const data = res.data as unknown as object;
        if ('dirInfo' in data && data.dirInfo) {
          const dirInfo = data.dirInfo as IFile[];
          const dirs = dirInfo.filter((item) => item.isDir);
          const files = dirInfo.filter((item) => !item.isDir);
          dirs.sort((a, b) => a.name.localeCompare(b.name));
          files.sort((a, b) => a.name.localeCompare(b.name));
          fileList.set([...dirs, ...files]);
        }
      });
    },
    [currentPathString, refresh.value]
  );

  const handleRefresh = () => refresh.set(!refresh.value);

  const handleBack = () => !isBasePath && currentPath.set(currentPath.value.slice(0, currentPath.value.length - 1));

  const handleCreateNewFile = (source: string, name: string) =>
    api.assetsControllerCreateNewFile({ source, name }).then(() => handleRefresh());

  const handleCreateNewFolder = (source: string, name: string) =>
    api.assetsControllerCreateNewFolder({ source, name }).then(() => handleRefresh());

  const handleOpenFolder = () => api.assetsControllerOpenDict(currentPathString);

  const handleRenameFile = (source: string, newName: string) =>
    api.assetsControllerRename({ source, newName }).then(() => handleRefresh());

  const handleDeleteFile = (source: string) =>
    api.assetsControllerDeleteFileOrDir({ source }).then(() => handleRefresh());

  const createNewFilePopoverOpen = useValue(false);
  const createNewFolderPopoverOpen = useValue(false);
  const newFileName = useValue('');
  const uploadAssetPopoverOpen = useValue(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
      <div className={styles.controll}>
        {!isBasePath && <Button icon={<ArrowLeftIcon />} size='small' onClick={handleBack} />}
        <Input
          value={isBasePath ? '/' : currentPathString.replace(basePath.join('/'), '')}
          size='small'
          style={{ flexGrow: 1, minWidth: 0 }}
        />

        <Popover
          withArrow
          open={createNewFilePopoverOpen.value}
          onOpenChange={() => createNewFilePopoverOpen.set(!createNewFilePopoverOpen.value)}
        >
          <PopoverTrigger>
            <Button icon={<DocumentAddIcon />} size='small' />
          </PopoverTrigger>
          <PopoverSurface>
            <Text as="h3" block size={500}>
              {t("$createNewFile")}
            </Text>
            <div style={{ display: "flex", flexFlow: "column", alignItems: "center" }}>
              <Input
                value={newFileName.value}
                placeholder={t("$newFileName")}
                onChange={(_, data) => {
                  newFileName.set(data.value ?? "");
                }}
              />
              <br />
              <Button
                appearance="primary"
                onClick={() => {
                  handleCreateNewFile(currentPathString, newFileName.value);
                  createNewFilePopoverOpen.set(false);
                  newFileName.set('');
                }}
              >{t("$common.create")}</Button>
            </div>
          </PopoverSurface>
        </Popover>

        <Popover
          withArrow
          open={createNewFolderPopoverOpen.value}
          onOpenChange={() => createNewFolderPopoverOpen.set(!createNewFolderPopoverOpen.value)}
        >
          <PopoverTrigger>
            <Button icon={<FolderAddIcon />} size='small' />
          </PopoverTrigger>
          <PopoverSurface>
            <Text as="h3" block size={500}>
              {t("$createNewFolder")}
            </Text>
            <div style={{ display: "flex", flexFlow: "column", alignItems: "center" }}>
              <Input
                value={newFileName.value} 
                placeholder={t("$newFolderName")}
                onChange={(_, data) => {
                  newFileName.set(data.value ?? "");
                }}
              />
              <br />
              <Button
                appearance="primary"
                onClick={() => {
                  handleCreateNewFolder(currentPathString, newFileName.value);
                  createNewFolderPopoverOpen.set(false);
                  newFileName.set('');
                }}
              >{t("$common.create")}</Button>
            </div>
          </PopoverSurface>
        </Popover>

        <Popover
          withArrow
          open={uploadAssetPopoverOpen.value}
          onOpenChange={() => uploadAssetPopoverOpen.set(!uploadAssetPopoverOpen.value)}
        >
          <PopoverTrigger>
            <Button icon={<ArrowExportUpIcon />} size='small' />
          </PopoverTrigger>
          <PopoverSurface>
            <Text as="h3" block size={500}>
              {t("$uploadAsset")}
            </Text>
            <FileUploader onUpload={() => {
              handleRefresh();
            }} targetDirectory={currentPathString}
            uploadUrl="/api/assets/upload" />
          </PopoverSurface>
        </Popover>

        <Menu>
          <MenuTrigger>
            <Button icon={<MoreVerticalIcon />} size='small'/>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem icon={<ArrowSyncIcon />} onClick={handleRefresh} >{t('$refresh')}</MenuItem>
              <MenuItem icon={<FolderOpenIcon />} onClick={handleOpenFolder} >{t('$openFolder')}</MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>
      <div style={{display: 'flex', padding: '4px 8px', gap: '4px'}}>
        {supportedExtName?.map(item => <Badge appearance='outline' key={item}>{item}</Badge>)}
      </div>
      <div style={{ overflow: 'auto' }}>
        {
          fileList.value?.map(file =>
            <FileElement
              key={file.name}
              file={file}
              name={fileConfig?.get(`${currentPathString}/${file.name}`)?.name ?? undefined}
              currentPath={currentPath}
              folderType={folderType.value}
              isProtected={fileConfig?.get(`${currentPathString}/${file.name}`)?.isProtected ?? false}
              handleRenameFile={handleRenameFile}
              handleDeleteFile={handleDeleteFile}
            />
          )
        }
      </div>
    </div>
  );
}

interface IFileUploaderProps {
  targetDirectory: string;
  uploadUrl: string;
  onUpload: () => void;
}

function FileUploader({ targetDirectory, uploadUrl, onUpload }: IFileUploaderProps) {
  const t = useTrans();

  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(event.target.files!));
  };

  const handleUpload = () => {
    const formData = new FormData();
    formData.append("targetDirectory", targetDirectory);
    files.forEach((file) => {
      formData.append("files", file);
    });

    axios.post(uploadUrl, formData).then((response) => {
      if (response.data) {
        onUpload();
      }
    });
  };

  return (
    <div className={styles.fileUploadContainer}>
      <div>
        <input className={styles.fileSelectInput} type="file" multiple onChange={handleFileChange} />
      </div>
      <Button appearance='primary' onClick={handleUpload}>{t("$upload")}</Button>
    </div>
  );
}