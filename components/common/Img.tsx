import React, { useState } from 'react';

interface ImgProps {
    src: string;
    alt?: string;
    placeholderSrc?: string;
    [key: string]: any;
}

export const Img: React.FC<ImgProps> = ({
    src,
    alt = 'Image',
    placeholderSrc = '/placeholder.svg',
    ...props
}) => {
    const [imgSrc, setImgSrc] = useState(src);

    const handleError = () => {
        setImgSrc(placeholderSrc);
    };

    return (
        <img
            src={imgSrc}
            alt={alt}
            onError={handleError}
            {...props}
        />
    );
};

export default Img;
