import json
import logging

from django.db import transaction
from django.core.files.storage import default_storage
from django.utils.text import slugify
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from apps.accounts.permissions import IsAdmin
from .models import (
    Category, Product, ProductImage, ProductVariation,
    AttributeType, AttributeValue, VariationAttribute, VariationImage,
)
from .serializers import (
    CategorySerializer, ProductSerializer, AttributeTypeWithValuesSerializer,
    AttributeValueSerializer, AttributeValueBriefSerializer, AttributeTypeSerializer,
)

logger = logging.getLogger(__name__)


def generate_unique_slug(name, model_class, exclude_id=None):
    """Generate slug with collision detection (appends -1, -2, etc.)."""
    base_slug = slugify(name, allow_unicode=False)
    if not base_slug:
        base_slug = 'product'
    slug = base_slug
    counter = 1
    qs = model_class.objects.all()
    if exclude_id:
        qs = qs.exclude(id=exclude_id)
    while qs.filter(slug=slug).exists():
        slug = f'{base_slug}-{counter}'
        counter += 1
    return slug


# ===== Public Product Views =====

class ProductListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        products = Product.objects.select_related('category').prefetch_related(
            'images',
            'variations__attributes__attribute_value__attribute_type',
            'variations__images',
        ).order_by('-updated_at')
        return Response(ProductSerializer(products, many=True).data)


class ProductSearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        qs = Product.objects.select_related('category').prefetch_related(
            'images',
            'variations__attributes__attribute_value__attribute_type',
            'variations__images',
        )

        name = request.query_params.get('name')
        if name:
            qs = qs.filter(name__icontains=name)

        category_id = request.query_params.get('category_id')
        if category_id:
            qs = qs.filter(category_id=category_id)

        category_name = request.query_params.get('category_name')
        if category_name:
            qs = qs.filter(category__name__icontains=category_name)

        min_price = request.query_params.get('min_price')
        if min_price:
            qs = qs.filter(base_price__gte=min_price)

        max_price = request.query_params.get('max_price')
        if max_price:
            qs = qs.filter(base_price__lte=max_price)

        products = qs.order_by('-updated_at')
        return Response(ProductSerializer(products, many=True).data)


class ProductDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            product = Product.objects.select_related('category').prefetch_related(
                'images',
                'variations__attributes__attribute_value__attribute_type',
                'variations__images',
            ).get(pk=pk)
        except Product.DoesNotExist:
            return Response(
                {'message': 'Không tìm thấy sản phẩm'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(ProductSerializer(product).data)


class ProductsByCategoryIdView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        if not Category.objects.filter(pk=pk).exists():
            return Response({'error': 'Danh mục không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

        products = Product.objects.filter(category_id=pk).select_related('category').prefetch_related(
            'images',
            'variations__attributes__attribute_value__attribute_type',
            'variations__images',
        ).order_by('-updated_at')
        return Response(ProductSerializer(products, many=True).data)


class ProductsByCategorySlugView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        try:
            category = Category.objects.get(slug=slug)
        except Category.DoesNotExist:
            return Response({'error': 'Danh mục không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

        products = Product.objects.filter(category_id=category.id).prefetch_related(
            'images',
            'variations__attributes__attribute_value__attribute_type',
        ).order_by('-updated_at')
        return Response(ProductSerializer(products, many=True).data)


# ===== Public Category Views =====

class CategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        search = request.query_params.get('search', '')
        qs = Category.objects.all()
        if search:
            qs = qs.filter(name__icontains=search)
        return Response(CategorySerializer(qs, many=True).data)


class CategoryDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            category = Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return Response({'error': 'Danh mục không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(CategorySerializer(category).data)


# ===== Public Attribute Views =====

class AttributeTypeListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        search = request.query_params.get('search', '')
        qs = AttributeType.objects.prefetch_related('attribute_values')
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(display_name__icontains=search)
        return Response({'data': AttributeTypeWithValuesSerializer(qs, many=True).data})


class AttributeTypeDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            attr_type = AttributeType.objects.prefetch_related('attribute_values').get(pk=pk)
        except AttributeType.DoesNotExist:
            return Response({'message': 'Không tìm thấy atrribute type'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'data': AttributeTypeWithValuesSerializer(attr_type).data})


class AttributeValueListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        qs = AttributeValue.objects.select_related('attribute_type')

        attr_type_id = request.query_params.get('attribute_type_id')
        if attr_type_id:
            qs = qs.filter(attribute_type_id=attr_type_id)

        search = request.query_params.get('search')
        if search:
            qs = qs.filter(value__icontains=search) | qs.filter(display_value__icontains=search)

        return Response({'data': AttributeValueSerializer(qs, many=True).data})


class AttributeValueDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            attr_val = AttributeValue.objects.select_related('attribute_type').get(pk=pk)
        except AttributeValue.DoesNotExist:
            return Response({'message': 'Không tìm thấy attribute Value'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'data': AttributeValueSerializer(attr_val).data})


# ===== Admin Category Views =====

class AdminCategoryCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        name = request.data.get('name')
        description = request.data.get('description')

        if not name:
            return Response({'errors': {'name': ['The name field is required.']}}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        if Category.objects.filter(name=name).exists():
            return Response({'errors': {'name': ['The name has already been taken.']}}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        image_path = None
        if 'image' in request.FILES:
            img = request.FILES['image']
            image_path = default_storage.save(f'category_images/{img.name}', img)

        category = Category(
            name=name,
            slug=slugify(name, allow_unicode=False) or 'category',
            description=description,
            image=image_path,
        )
        category.save()

        return Response({
            'message': 'Danh mục đã được tạo.',
            'category': CategorySerializer(category).data,
        }, status=status.HTTP_201_CREATED)


class AdminCategoryDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def put(self, request, pk):
        try:
            category = Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return Response({'error': 'Danh mục không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

        name = request.data.get('name')
        if not name:
            return Response({'errors': {'name': ['The name field is required.']}}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        if Category.objects.filter(name=name).exclude(pk=pk).exists():
            return Response({'errors': {'name': ['The name has already been taken.']}}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        category.name = name
        category.slug = slugify(name, allow_unicode=False) or 'category'
        category.description = request.data.get('description')

        if 'image' in request.FILES:
            img = request.FILES['image']
            category.image = default_storage.save(f'category_images/{img.name}', img)

        category.save()

        return Response({
            'message': 'Danh mục đã được cập nhật.',
            'category': CategorySerializer(category).data,
        })

    def delete(self, request, pk):
        try:
            category = Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return Response({'error': 'Danh mục không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

        category.delete()
        return Response({'message': 'Danh mục đã được xóa.'})


# ===== Admin Product Views =====

class AdminProductCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        data = request.data
        logger.info("Product create request data keys: %s", list(data.keys()))
        logger.info("Product create request FILES keys: %s", list(request.FILES.keys()))

        # Validation
        errors = {}
        if not data.get('name'):
            errors['name'] = ['The name field is required.']
        if not data.get('category_id'):
            errors['category_id'] = ['The category id field is required.']
        elif not Category.objects.filter(id=data['category_id']).exists():
            errors['category_id'] = ['The selected category id is invalid.']
        if not data.get('base_price'):
            errors['base_price'] = ['The base price field is required.']

        # Parse variations from JSON string, list, or FormData indexed keys
        variations_raw = data.get('variations')
        has_indexed_variations = any(k.startswith('variations[') or k.startswith('variations.') for k in data)

        if not variations_raw and not has_indexed_variations:
            errors['variations'] = ['The variations field is required.']

        if errors:
            return Response({'message': 'Validation Error', 'errors': errors}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        # Parse variations
        if has_indexed_variations and not variations_raw:
            # FormData: variations[0][sku]=X, variations[0][price]=Y, ...
            variations_data = self._parse_variations_from_form(request)
        elif isinstance(variations_raw, str):
            try:
                variations_data = json.loads(variations_raw)
            except json.JSONDecodeError:
                return Response({'message': 'Validation Error', 'errors': {'variations': ['Invalid JSON']}}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        elif isinstance(variations_raw, list):
            variations_data = variations_raw
        else:
            # Handle dict-like querydict entries
            variations_data = self._parse_variations_from_form(request)

        with transaction.atomic():
            try:
                slug = generate_unique_slug(data['name'], Product)

                product = Product(
                    name=data['name'],
                    slug=slug,
                    category_id=int(data['category_id']),
                    base_price=data['base_price'],
                    description=data.get('description') or None,
                    featured=_to_bool(data.get('featured', False)),
                    status=_to_bool(data.get('status', True)),
                )
                product.save()

                # Product images — handle both 'images' and 'images[0]', 'images[1]' keys
                images = request.FILES.getlist('images')
                if not images:
                    # Axios auto-serializes arrays as indexed keys: images[0], images[1], ...
                    i = 0
                    while True:
                        f = request.FILES.get(f'images[{i}]')
                        if f is None:
                            break
                        images.append(f)
                        i += 1
                logger.info("Product images found: %d files", len(images))
                for idx, img in enumerate(images):
                    path = default_storage.save(f'product_images/{img.name}', img)
                    ProductImage(
                        product=product,
                        image_path=path,
                        is_primary=(idx == 0),
                    ).save()

                # Variations
                has_default = False
                for v_idx, v_data in enumerate(variations_data):
                    if isinstance(v_data, str):
                        v_data = json.loads(v_data)

                    sku = v_data.get('sku')
                    if not sku:
                        raise ValueError(f"Variation {v_idx} missing SKU")

                    if ProductVariation.objects.filter(sku=sku).exists():
                        raise ValueError(f"SKU '{sku}' đã tồn tại trong hệ thống.")

                    is_default = _to_bool(v_data.get('is_default', False))
                    if is_default:
                        has_default = True

                    variation = ProductVariation(
                        product=product,
                        sku=sku,
                        price=v_data['price'],
                        discount_price=v_data.get('discount_price') or None,
                        stock_quantity=int(v_data.get('stock_quantity', 0)),
                        is_default=is_default,
                        status=_to_bool(v_data.get('status', True)),
                    )
                    variation.save()

                    # Variation attributes
                    attrs = v_data.get('attributes', [])
                    if isinstance(attrs, str):
                        attrs = json.loads(attrs)
                    for attr in attrs:
                        VariationAttribute(
                            product_variation=variation,
                            attribute_value_id=int(attr['attribute_value_id']),
                        ).save()

                    # Variation images — handle multiple key formats
                    v_images = request.FILES.getlist(f'variations[{v_idx}][images]')
                    if not v_images:
                        v_images = request.FILES.getlist(f'variations.{v_idx}.images')
                    if not v_images:
                        # Axios indexed: variations[0][images][0], variations[0][images][1], ...
                        vi = 0
                        while True:
                            f = request.FILES.get(f'variations[{v_idx}][images][{vi}]')
                            if f is None:
                                break
                            v_images.append(f)
                            vi += 1
                    for img_idx, img in enumerate(v_images):
                        path = default_storage.save(f'variation_images/{img.name}', img)
                        VariationImage(
                            product_variation=variation,
                            image_path=path,
                            is_primary=(img_idx == 0),
                        ).save()

                # Ensure at least one default
                if not has_default:
                    first = ProductVariation.objects.filter(product=product).first()
                    if first:
                        first.is_default = True
                        first.save()

                return Response({
                    'message': 'Sản phẩm đã được tạo thành công.',
                    'product_id': product.id,
                }, status=status.HTTP_201_CREATED)

            except Exception as e:
                logger.error("Error creating product: %s", str(e))
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _parse_variations_from_form(self, request):
        """Parse variations from FormData like variations[0][sku]=X."""
        variations = {}
        for key in request.data:
            if key.startswith('variations[') or key.startswith('variations.'):
                parts = key.replace('variations[', '').replace('][', '.').replace(']', '').split('.')
                if key.startswith('variations.'):
                    parts = key.replace('variations.', '').split('.')
                idx = int(parts[0])
                if idx not in variations:
                    variations[idx] = {}
                if len(parts) == 2:
                    variations[idx][parts[1]] = request.data[key]
                elif len(parts) >= 3:
                    # Nested like attributes[0][attribute_value_id]
                    sub_key = parts[1]
                    if sub_key not in variations[idx]:
                        variations[idx][sub_key] = {}
                    sub_idx = int(parts[2]) if parts[2].isdigit() else parts[2]
                    if isinstance(variations[idx][sub_key], dict):
                        if isinstance(sub_idx, int):
                            if sub_idx not in variations[idx][sub_key]:
                                variations[idx][sub_key][sub_idx] = {}
                            if len(parts) > 3:
                                variations[idx][sub_key][sub_idx][parts[3]] = request.data[key]
                        else:
                            variations[idx][sub_key][sub_idx] = request.data[key]

        result = []
        for idx in sorted(variations.keys()):
            v = variations[idx]
            # Convert attributes dict to list
            if 'attributes' in v and isinstance(v['attributes'], dict):
                v['attributes'] = [v['attributes'][k] for k in sorted(v['attributes'].keys())]
            result.append(v)
        return result


class AdminProductUpdateView(APIView):
    """POST /api/admin/products/{id} — product update (Laravel uses POST, not PUT)."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'message': 'Không tìm thấy sản phẩm'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        logger.info("Product update request data: %s", data)

        # Parse variations
        variations_raw = data.get('variations')
        has_indexed_variations = any(k.startswith('variations[') or k.startswith('variations.') for k in data)
        variations_data = None
        if has_indexed_variations and not variations_raw:
            variations_data = AdminProductCreateView()._parse_variations_from_form(request)
        elif variations_raw:
            if isinstance(variations_raw, str):
                try:
                    variations_data = json.loads(variations_raw)
                except json.JSONDecodeError:
                    variations_data = []
            elif isinstance(variations_raw, list):
                variations_data = variations_raw
            else:
                variations_data = AdminProductCreateView()._parse_variations_from_form(request)

        with transaction.atomic():
            try:
                # 1. Update basic product info
                update_fields = {}
                if data.get('name'):
                    update_fields['name'] = data['name']
                    update_fields['slug'] = generate_unique_slug(data['name'], Product, exclude_id=pk)
                if data.get('category_id'):
                    update_fields['category_id'] = int(data['category_id'])
                if data.get('base_price'):
                    update_fields['base_price'] = data['base_price']
                if 'description' in data:
                    update_fields['description'] = data['description']
                if 'featured' in data:
                    update_fields['featured'] = _to_bool(data['featured'])
                if 'status' in data:
                    update_fields['status'] = _to_bool(data['status'])

                for k, v in update_fields.items():
                    setattr(product, k, v)
                if update_fields:
                    product.save()

                # 2. Handle product images
                if _to_bool(data.get('delete_all_images', False)):
                    ProductImage.objects.filter(product=product).delete()

                existing_images = data.getlist('existing_images') if hasattr(data, 'getlist') else data.get('existing_images', [])
                # Also handle indexed keys: existing_images[0], existing_images[1], ...
                if not existing_images:
                    existing_images = [data[k] for k in sorted(data) if k.startswith('existing_images[')]
                if existing_images and not _to_bool(data.get('delete_all_images', False)):
                    if isinstance(existing_images, str):
                        existing_images = [existing_images]
                    ProductImage.objects.filter(product=product).exclude(image_path__in=existing_images).delete()
                    # Ensure primary
                    if not ProductImage.objects.filter(product=product, is_primary=True).exists():
                        first = ProductImage.objects.filter(product=product, image_path__in=existing_images).first()
                        if first:
                            first.is_primary = True
                            first.save()

                # Upload new images — handle both 'images' and 'images[0]' keys
                new_images = request.FILES.getlist('images')
                if not new_images:
                    i = 0
                    while True:
                        f = request.FILES.get(f'images[{i}]')
                        if f is None:
                            break
                        new_images.append(f)
                        i += 1
                if new_images:
                    primary_exists = ProductImage.objects.filter(product=product, is_primary=True).exists()
                    for idx, img in enumerate(new_images):
                        path = default_storage.save(f'product_images/{img.name}', img)
                        is_primary = not primary_exists and idx == 0
                        ProductImage(product=product, image_path=path, is_primary=is_primary).save()
                        if is_primary:
                            primary_exists = True

                # 3. Delete variations
                delete_vars = data.getlist('delete_variations') if hasattr(data, 'getlist') else data.get('delete_variations', [])
                if not delete_vars:
                    delete_vars = [data[k] for k in sorted(data) if k.startswith('delete_variations[')]
                if delete_vars:
                    if isinstance(delete_vars, str):
                        delete_vars = [delete_vars]
                    ProductVariation.objects.filter(product=product, id__in=[int(x) for x in delete_vars]).delete()

                # 4. Handle variations
                if variations_data:
                    default_found = False

                    for v_idx, v_data in enumerate(variations_data):
                        if isinstance(v_data, str):
                            v_data = json.loads(v_data)

                        v_id = v_data.get('id')

                        if v_id:
                            # Update existing
                            try:
                                variation = ProductVariation.objects.get(id=int(v_id), product=product)
                            except ProductVariation.DoesNotExist:
                                raise ValueError(f"Không tìm thấy biến thể ID: {v_id} cho sản phẩm này")

                            if v_data.get('sku') is not None:
                                variation.sku = v_data['sku']
                            if v_data.get('price') is not None:
                                variation.price = v_data['price']
                            if 'discount_price' in v_data:
                                variation.discount_price = v_data['discount_price'] or None
                            if v_data.get('stock_quantity') is not None:
                                variation.stock_quantity = int(v_data['stock_quantity'])
                            if v_data.get('status') is not None:
                                variation.status = _to_bool(v_data['status'])

                            if v_data.get('is_default') is not None:
                                is_def = _to_bool(v_data['is_default'])
                                variation.is_default = is_def
                                if is_def:
                                    default_found = True
                                    ProductVariation.objects.filter(product=product).exclude(id=variation.id).update(is_default=False)

                            variation.save()

                        elif v_data.get('sku'):
                            # Create new variation
                            sku = v_data['sku']
                            if ProductVariation.objects.filter(sku=sku).exists():
                                raise ValueError(f"SKU '{sku}' đã tồn tại trong hệ thống.")

                            is_def = _to_bool(v_data.get('is_default', False))
                            if is_def:
                                default_found = True
                                ProductVariation.objects.filter(product=product).update(is_default=False)

                            variation = ProductVariation(
                                product=product,
                                sku=sku,
                                price=v_data.get('price', product.base_price),
                                discount_price=v_data.get('discount_price') or None,
                                stock_quantity=int(v_data.get('stock_quantity', 0)),
                                is_default=is_def,
                                status=_to_bool(v_data.get('status', True)),
                            )
                            variation.save()
                        else:
                            continue

                        # Handle variation attributes
                        attrs = v_data.get('attributes')
                        if attrs:
                            if isinstance(attrs, str):
                                attrs = json.loads(attrs)
                            VariationAttribute.objects.filter(product_variation=variation).delete()
                            for attr in attrs:
                                if attr.get('attribute_value_id'):
                                    VariationAttribute(
                                        product_variation=variation,
                                        attribute_value_id=int(attr['attribute_value_id']),
                                    ).save()

                        # Handle variation images
                        if _to_bool(v_data.get('delete_all_images', False)):
                            VariationImage.objects.filter(product_variation=variation).delete()

                        # New variation images — handle indexed keys too
                        v_images = request.FILES.getlist(f'variations[{v_idx}][images]')
                        if not v_images:
                            v_images = request.FILES.getlist(f'variations.{v_idx}.images')
                        if not v_images:
                            vi = 0
                            while True:
                                f = request.FILES.get(f'variations[{v_idx}][images][{vi}]')
                                if f is None:
                                    break
                                v_images.append(f)
                                vi += 1
                        if v_images:
                            primary_exists = VariationImage.objects.filter(
                                product_variation=variation, is_primary=True
                            ).exists()
                            for img_idx, img in enumerate(v_images):
                                path = default_storage.save(f'variation_images/{img.name}', img)
                                is_primary = not primary_exists and img_idx == 0
                                VariationImage(
                                    product_variation=variation,
                                    image_path=path,
                                    is_primary=is_primary,
                                ).save()
                                if is_primary:
                                    primary_exists = True

                        # Existing variation images
                        v_existing_imgs = v_data.get('existing_images')
                        if v_existing_imgs and not _to_bool(v_data.get('delete_all_images', False)):
                            if isinstance(v_existing_imgs, str):
                                v_existing_imgs = [v_existing_imgs]
                            VariationImage.objects.filter(
                                product_variation=variation
                            ).exclude(image_path__in=v_existing_imgs).delete()
                            if not VariationImage.objects.filter(product_variation=variation, is_primary=True).exists():
                                first_img = VariationImage.objects.filter(product_variation=variation).first()
                                if first_img:
                                    first_img.is_primary = True
                                    first_img.save()

                    # Ensure at least one default
                    if not default_found:
                        first = ProductVariation.objects.filter(product=product).first()
                        if first:
                            first.is_default = True
                            first.save()

                # Return updated product
                product.refresh_from_db()
                updated = Product.objects.select_related('category').prefetch_related(
                    'images',
                    'variations__attributes__attribute_value__attribute_type',
                    'variations__images',
                ).get(pk=pk)

                return Response({
                    'message': 'Sản phẩm đã được cập nhật thành công.',
                    'product': ProductSerializer(updated).data,
                })

            except Exception as e:
                logger.error("Error updating product: %s", str(e))
                return Response({
                    'error': str(e),
                    'message': 'Đã xảy ra lỗi khi cập nhật sản phẩm.',
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminProductDetailView(APIView):
    """Combined view for POST (update) and DELETE on /api/admin/products/{id}."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        return AdminProductUpdateView().post(request, pk)

    def delete(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'message': 'Không tìm thấy sản phẩm'}, status=status.HTTP_404_NOT_FOUND)

        product.delete()
        return Response({'message': 'Xóa sản phẩm thành công'})


# ===== Admin Attribute Type Views =====

class AdminAttrTypeCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        name = request.data.get('name')
        display_name = request.data.get('display_name')

        if not name or not display_name:
            errors = {}
            if not name:
                errors['name'] = ['The name field is required.']
            if not display_name:
                errors['display_name'] = ['The display name field is required.']
            return Response({'message': 'Validation Error', 'errors': errors}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        if AttributeType.objects.filter(name=name).exists():
            return Response({'message': 'Validation Error', 'errors': {'name': ['The name has already been taken.']}}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        try:
            attr_type = AttributeType(name=name, display_name=display_name)
            attr_type.save()
            return Response({
                'message': 'Attribute type đã được tạo thành công',
                'data': AttributeTypeSerializer(attr_type).data,
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'message': 'Đã xảy ra lỗi', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminAttrTypeDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def put(self, request, pk):
        try:
            attr_type = AttributeType.objects.get(pk=pk)
        except AttributeType.DoesNotExist:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        name = request.data.get('name')
        display_name = request.data.get('display_name')

        if not name or not display_name:
            return Response({'message': 'Validation Error'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        if AttributeType.objects.filter(name=name).exclude(pk=pk).exists():
            return Response({'message': 'Validation Error', 'errors': {'name': ['The name has already been taken.']}}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        try:
            attr_type.name = name
            attr_type.display_name = display_name
            attr_type.save()
            return Response({
                'message': 'Attribute type đã được cập nhật thành công',
                'data': AttributeTypeSerializer(attr_type).data,
            })
        except Exception as e:
            return Response({'message': 'Đã xảy ra lỗi', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, pk):
        try:
            attr_type = AttributeType.objects.get(pk=pk)
        except AttributeType.DoesNotExist:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        count = AttributeValue.objects.filter(attribute_type_id=pk).count()
        if count > 0:
            return Response({
                'message': f'Không thể xóa attribute type này vì đang có {count} giá trị được liên kết.',
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            attr_type.delete()
            return Response({'message': 'Attribute type đã được xóa thành công'})
        except Exception as e:
            return Response({'message': 'Đã xảy ra lỗi', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ===== Admin Attribute Value Views =====

class AdminAttrValueCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        attr_type_id = request.data.get('attribute_type_id')
        value = request.data.get('value')
        display_value = request.data.get('display_value')

        errors = {}
        if not attr_type_id:
            errors['attribute_type_id'] = ['Required.']
        elif not AttributeType.objects.filter(id=attr_type_id).exists():
            errors['attribute_type_id'] = ['Invalid.']
        if not value:
            errors['value'] = ['Required.']
        if not display_value:
            errors['display_value'] = ['Required.']
        if errors:
            return Response({'message': 'Validation Error', 'errors': errors}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        if AttributeValue.objects.filter(attribute_type_id=attr_type_id, value=value).exists():
            return Response({'message': 'Giá trị này đã tồn tại cho loại thuộc tính này.'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        try:
            attr_val = AttributeValue(attribute_type_id=int(attr_type_id), value=value, display_value=display_value)
            attr_val.save()
            return Response({
                'message': 'Attribute value đã được tạo thành công',
                'data': AttributeValueBriefSerializer(attr_val).data,
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'message': 'Đã xảy ra lỗi', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminAttrValueDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def put(self, request, pk):
        try:
            attr_val = AttributeValue.objects.get(pk=pk)
        except AttributeValue.DoesNotExist:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        attr_type_id = request.data.get('attribute_type_id')
        value = request.data.get('value')
        display_value = request.data.get('display_value')

        if not all([attr_type_id, value, display_value]):
            return Response({'message': 'Validation Error'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        if AttributeValue.objects.filter(attribute_type_id=attr_type_id, value=value).exclude(pk=pk).exists():
            return Response({'message': 'Giá trị này đã tồn tại cho loại thuộc tính này.'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        try:
            attr_val.attribute_type_id = int(attr_type_id)
            attr_val.value = value
            attr_val.display_value = display_value
            attr_val.save()
            return Response({
                'message': 'Attribute value đã được cập nhật thành công',
                'data': AttributeValueBriefSerializer(attr_val).data,
            })
        except Exception as e:
            return Response({'message': 'Đã xảy ra lỗi', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, pk):
        try:
            attr_val = AttributeValue.objects.get(pk=pk)
        except AttributeValue.DoesNotExist:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        if VariationAttribute.objects.filter(attribute_value_id=pk).exists():
            return Response({
                'message': 'Không thể xóa giá trị thuộc tính này vì đang được sử dụng trong các biến thể sản phẩm.',
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            attr_val.delete()
            return Response({'message': 'Attribute value đã được xóa thành công'})
        except Exception as e:
            return Response({'message': 'Đã xảy ra lỗi', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminAttrValueByTypeView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, pk):
        try:
            AttributeType.objects.get(pk=pk)
        except AttributeType.DoesNotExist:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        vals = AttributeValue.objects.filter(attribute_type_id=pk)
        return Response({'data': AttributeValueBriefSerializer(vals, many=True).data})


def _to_bool(value):
    """Convert various truthy values to Python bool."""
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.lower() in ('true', '1', 'yes')
    return bool(value)
