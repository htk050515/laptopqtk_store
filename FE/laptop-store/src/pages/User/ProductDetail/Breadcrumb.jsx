
// Breadcrumb.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import path from '../../../constants/path';

const Breadcrumb = ({ product }) => {
    return (
        <nav className="text-sm flex items-center gap-2">
            <Link to={path.home} className="hover:text-[#2563eb]">Trang chủ</Link>
            <span>&gt;</span>
            <Link to={`/category/${product?.categories?.slug}`} className="hover:text-[#2563eb]">{product?.categories?.name}</Link>
            <span>&gt;</span>
            <span>{product?.name}</span>
        </nav>
    );
};

export default Breadcrumb;