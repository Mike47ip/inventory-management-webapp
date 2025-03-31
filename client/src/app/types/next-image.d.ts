import React from 'react';

declare module 'next/image' {
  interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string | StaticImageData;
    width?: number | string;
    height?: number | string;
    layout?: 'fixed' | 'intrinsic' | 'responsive' | 'fill';
    objectFit?: React.CSSProperties['objectFit'];
    quality?: number;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
  }

  interface StaticImageData {
    src: string;
    height: number;
    width: number;
    blurDataURL?: string;
  }

  const Image: React.FC<ImageProps>;
  export default Image;
}