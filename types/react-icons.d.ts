// Type declarations for react-icons to fix className prop issues
// react-icons v5+ has stricter types that don't include className by default

import 'react-icons';

declare module 'react-icons' {
  export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
    children?: React.ReactNode;
    size?: string | number;
    color?: string;
    title?: string;
    className?: string;
  }
}

declare module 'react-icons/tb' {
  import { IconType } from 'react-icons';
  export const TbCrop: IconType;
  export const TbPalette: IconType;
  export const TbRotateClockwise: IconType;
  export const TbPhotoSearch: IconType;
}

declare module 'react-icons/ri' {
  import { IconType } from 'react-icons';
  export const RiCloseLine: IconType;
  export const RiSearchLine: IconType;
  export const RiUploadLine: IconType;
  export const RiSparklingLine: IconType;
  export const RiGlobalLine: IconType;
  export const RiCreativeCommonsLine: IconType;
  export const RiArrowLeftLine: IconType;
  export const RiMagicLine: IconType;
  export const RiAddLine: IconType;
  export const RiMicLine: IconType;
}

declare module 'react-icons/hi2' {
  import { IconType } from 'react-icons';
  export const HiArrowLongRight: IconType;
}

declare module 'react-icons/lu' {
  import { IconType } from 'react-icons';
  export const LuImage: IconType;
}
