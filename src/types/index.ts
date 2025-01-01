import type {TreeOption} from "naive-ui";

export interface FavoriteData extends TreeOption {
  favID: string,
  favName: string,
  mode?: string | 'mod' | 'modpack',
  folderHidden?: boolean | false,
  folderExpand?: boolean | false,
}

