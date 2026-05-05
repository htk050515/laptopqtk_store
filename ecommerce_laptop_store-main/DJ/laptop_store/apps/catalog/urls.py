from django.urls import path
from . import views

urlpatterns = [
    # Public product routes
    path('products', views.ProductListView.as_view()),
    path('products/search', views.ProductSearchView.as_view()),
    path('products/category/<int:pk>', views.ProductsByCategoryIdView.as_view()),
    path('products/category/slug/<str:slug>', views.ProductsByCategorySlugView.as_view()),
    path('products/<int:pk>', views.ProductDetailView.as_view()),
    # Public category routes
    path('categories', views.CategoryListView.as_view()),
    path('categories/<int:pk>', views.CategoryDetailView.as_view()),
    # Public attribute routes
    path('attribute-types', views.AttributeTypeListView.as_view()),
    path('attribute-types/<int:pk>', views.AttributeTypeDetailView.as_view()),
    path('attribute-values', views.AttributeValueListView.as_view()),
    path('attribute-values/<int:pk>', views.AttributeValueDetailView.as_view()),
    # Admin product routes
    path('admin/product', views.AdminProductCreateView.as_view()),
    path('admin/products/<int:pk>', views.AdminProductDetailView.as_view()),
    # Admin category routes
    path('admin/categories', views.AdminCategoryCreateView.as_view()),
    path('admin/categories/<int:pk>', views.AdminCategoryDetailView.as_view()),
    # Admin attribute type routes
    path('admin/attribute-types', views.AdminAttrTypeCreateView.as_view()),
    path('admin/attribute-types/<int:pk>', views.AdminAttrTypeDetailView.as_view()),
    # Admin attribute value routes
    path('admin/attribute-values', views.AdminAttrValueCreateView.as_view()),
    path('admin/attribute-values/<int:pk>', views.AdminAttrValueDetailView.as_view()),
    path('admin/attribute-values/by-type/<int:pk>', views.AdminAttrValueByTypeView.as_view()),
]
