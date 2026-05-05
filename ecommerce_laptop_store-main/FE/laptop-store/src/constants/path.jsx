const path = {
    //! Public Router
    error: '/error',
    home: '/',
    login: '/login',
    productDetail: 'products/:productId',
    search: '/search',
    category: '/category/:categoryId',

    //! User
    cart: '/cart',
    profile: '/profile',
    checkout: '/checkout',
    historyOrder: '/history-order',
    checkPaymentStatus: '/check-payment-status',

    //! Admin
    dashboard: '/dashboard', // Trang Thống kê
    manageCategory: '/admin/categories', // Quản lý thể loại
    manageProducts: '/admin/products', // Quản lý sản phẩm
    manageTypeAttributes: '/admin/type-attributes', // Quản lý sản phẩm
    manageValueAttributes: '/admin/value-attributes', // Quản lý sản phẩm
    manageUsers: '/admin/users', // Quản lý người dùng
    manageReviews: '/admin/reviews', // Quản lý nhận xét
    manageInvoices: '/admin/invoices', // Quản lý hóa đơn
};

export default path;
