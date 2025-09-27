import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService, AuthService, CategoryService, ImageService } from '../../../service';
import { Category } from '../../../model/category.model';
import { Image } from '../../../model/image.model';

export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  categoryId: string;
  storeId: string;
  imageId?: string;
  image?: Image;
}

@Component({
  selector: 'app-products',
  standalone: true,
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm = '';
  showModal = false;
  isEditing = false;
  currentProduct: Product = {
    name: '',
    description: '',
    price: 0,
    sku: '',
    categoryId: '',
    storeId: '',
    imageId: ''
  };
  isLoading = false;
  errorMessage = '';
  
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  categorySearchTerm = '';
  showCategoryDropdown = false;
  selectedCategory: Category | null = null;
  
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  uploadedImageId: string | null = null;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private authService: AuthService,
    private categoryService: CategoryService,
    public imageService: ImageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.isLoading = true;
    const headers = this.getAuthHeaders();
    
    const currentStoreId = this.authService.getCurrentStoreId();
    const url = currentStoreId 
      ? this.configService.getApiUrl(`/products?storeId=${currentStoreId}&page=0&limit=100`)
      : this.configService.getApiUrl('/products?page=0&limit=100');
    
    this.http.get<any>(url, { headers })
      .subscribe({
        next: (response) => {
          this.products = response.content || response;
          this.filteredProducts = [...this.products];
          
          
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erro ao carregar produtos:', error);
          this.isLoading = false;
        }
      });
  }

  loadCategories(): void {
    const currentStoreId = this.authService.getCurrentStoreId();
    
    if (currentStoreId) {
      this.categoryService.getCategoriesByStore(currentStoreId).subscribe({
        next: (categories) => {
          this.categories = categories;
          this.filteredCategories = categories;
          this.cdr.detectChanges();
          
          if (this.isEditing && this.currentProduct.categoryId) {
            this.setSelectedCategory(this.currentProduct);
          }
        },
        error: (error) => {
          console.error('Erro ao carregar categorias:', error);
        }
      });
    } else {
      this.categoryService.getAllCategories().subscribe({
        next: (categories) => {
          this.categories = categories;
          this.filteredCategories = categories;
          this.cdr.detectChanges();
          
          if (this.isEditing && this.currentProduct.categoryId) {
            this.setSelectedCategory(this.currentProduct);
          }
        },
        error: (error) => {
          console.error('Erro ao carregar categorias:', error);
        }
      });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
      
      this.uploadedImageId = null;
    }
  }

  clearImageSelection(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.uploadedImageId = null;
    this.currentProduct.imageId = '';
    this.cdr.detectChanges();
  }

  searchProducts(): void {
    if (!this.searchTerm.trim()) {
      this.filteredProducts = this.products;
      return;
    }

    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  searchCategories(): void {
    if (!this.categorySearchTerm.trim()) {
      this.filteredCategories = this.categories;
      return;
    }

    this.filteredCategories = this.categories.filter(category =>
      category.name.toLowerCase().includes(this.categorySearchTerm.toLowerCase())
    );
  }

  toggleCategoryDropdown(): void {
    this.showCategoryDropdown = !this.showCategoryDropdown;
    if (this.showCategoryDropdown) {
      this.categorySearchTerm = '';
      this.filteredCategories = this.categories;
    }
  }

  selectCategory(category: Category): void {
    this.selectedCategory = category;
    this.currentProduct.categoryId = category.id || '';
    this.showCategoryDropdown = false;
    this.categorySearchTerm = '';
    this.cdr.detectChanges();
  }

  clearCategorySelection(): void {
    this.selectedCategory = null;
    this.currentProduct.categoryId = '';
    this.categorySearchTerm = '';
    this.cdr.detectChanges();
  }

  private setSelectedCategory(product: Product): void {
    this.selectedCategory = this.categories.find(cat => {
      const match1 = cat.id === product.categoryId;
      const match2 = cat.id?.toString() === product.categoryId?.toString();
      const match3 = cat.id?.toString() === product.categoryId;
      const match4 = cat.id === product.categoryId?.toString();
      return match1 || match2 || match3 || match4;
    }) || null;
    
    this.categorySearchTerm = this.selectedCategory?.name || '';
    
    if (!this.selectedCategory && product.categoryId) {
      this.selectedCategory = this.categories.find(cat => 
        cat.id?.toString().includes(product.categoryId?.toString()) ||
        product.categoryId?.toString().includes(cat.id?.toString())
      ) || null;
      
      if (this.selectedCategory) {
        this.categorySearchTerm = this.selectedCategory.name;
      }
    }
    
    this.cdr.detectChanges();
  }


  openCreateModal(): void {
    this.isEditing = false;
    const currentStoreId = this.authService.getCurrentStoreId();
    
    this.currentProduct = {
      name: '',
      description: '',
      price: 0,
      sku: '',
      categoryId: '',
      storeId: currentStoreId || '',
      imageId: ''
    };
    this.selectedCategory = null;
    this.categorySearchTerm = '';
    this.showCategoryDropdown = false;
    this.selectedFile = null;
    this.imagePreview = null;
    this.uploadedImageId = null;
    this.showModal = true;
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  openEditModal(product: Product): void {
    this.isEditing = true;
    this.currentProduct = { ...product };
    
    
    if (this.categories.length === 0) {
      this.loadCategories();
      setTimeout(() => {
        this.setSelectedCategory(product);
      }, 200);
    } else {
      this.setSelectedCategory(product);
    }
    
    this.showCategoryDropdown = false;
    
    if (product.image) {
      this.imagePreview = this.imageService.getImageUrl(product.image.fileName);
      this.uploadedImageId = product.image.id;
    } else {
      this.selectedFile = null;
      this.imagePreview = null;
      this.uploadedImageId = null;
    }
    
    this.showModal = true;
    this.errorMessage = '';
    
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  closeModal(): void {
    this.showModal = false;
    this.currentProduct = {
      name: '',
      description: '',
      price: 0,
      sku: '',
      categoryId: '',
      storeId: '',
      imageId: ''
    };
    this.selectedCategory = null;
    this.categorySearchTerm = '';
    this.showCategoryDropdown = false;
    this.selectedFile = null;
    this.imagePreview = null;
    this.uploadedImageId = null;
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  saveProduct(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    
    if (this.selectedFile) {
      this.imageService.uploadImage(this.selectedFile, 'product').subscribe({
        next: (image) => {
          this.currentProduct.imageId = image.id;
          this.cdr.detectChanges();
          this.saveProductWithImage();
        },
        error: (error) => {
          console.error('Erro ao fazer upload da imagem:', error);
          this.errorMessage = 'Erro ao fazer upload da imagem';
          this.isLoading = false;
        }
      });
    } else {
      this.currentProduct.imageId = this.uploadedImageId || '';
      this.saveProductWithImage();
    }
  }

  private saveProductWithImage(): void {
    const headers = this.getAuthHeaders();
    
    
    const productData = {
      name: this.currentProduct.name,
      description: this.currentProduct.description,
      price: this.currentProduct.price,
      sku: this.currentProduct.sku,
      categoryId: this.currentProduct.categoryId,
      storeId: this.currentProduct.storeId || this.authService.getCurrentStoreId(),
      imageId: this.currentProduct.imageId && this.currentProduct.imageId.trim() !== '' ? this.currentProduct.imageId : null
    };
    
    
    if (!productData.storeId) {
      this.errorMessage = 'ID da loja é obrigatório';
      this.isLoading = false;
      return;
    }
    
    const request = this.isEditing
      ? this.http.put<Product>(this.configService.getApiUrl(`/products/${this.currentProduct.id}`), productData, { headers })
      : this.http.post<Product>(this.configService.getApiUrl('/products'), productData, { headers });

    request.subscribe({
      next: (product) => {
        if (this.isEditing) {
          const index = this.products.findIndex(p => p.id === product.id);
          if (index !== -1) {
            this.products[index] = product;
          }
        } else {
          this.products.push(product);
        }
        this.filteredProducts = [...this.products];
        this.closeModal();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao salvar produto:', error);
        this.errorMessage = 'Erro ao salvar produto';
        this.isLoading = false;
      }
    });
  }

  deleteProduct(product: Product): void {
    if (!confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
      return;
    }

    this.isLoading = true;
    const headers = this.getAuthHeaders();
    
    this.http.delete(this.configService.getApiUrl(`/products/${product.id}`), { headers })
      .subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== product.id);
          this.filteredProducts = [...this.products];
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erro ao excluir produto:', error);
          this.errorMessage = 'Erro ao excluir produto';
          this.isLoading = false;
        }
      });
  }

  private validateForm(): boolean {
    if (!this.currentProduct.name.trim()) {
      this.errorMessage = 'Nome do produto é obrigatório';
      return false;
    }
    if (!this.currentProduct.sku.trim()) {
      this.errorMessage = 'SKU é obrigatório';
      return false;
    }
    if (!this.currentProduct.description.trim()) {
      this.errorMessage = 'Descrição é obrigatória';
      return false;
    }
    if (this.currentProduct.price <= 0) {
      this.errorMessage = 'Preço deve ser maior que zero';
      return false;
    }
    if (!this.currentProduct.categoryId) {
      this.errorMessage = 'Categoria é obrigatória';
      return false;
    }
    return true;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
