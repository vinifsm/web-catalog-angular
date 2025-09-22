# Configuração de Ambiente

Este projeto utiliza arquivos de ambiente para gerenciar configurações específicas de cada ambiente (desenvolvimento, produção, etc.).

## Estrutura dos Arquivos

### Arquivos de Ambiente
- `src/environments/environment.ts` - Configuração padrão
- `src/environments/environment.development.ts` - Configuração de desenvolvimento
- `src/environments/environment.prod.ts` - Configuração de produção

### Serviço de Configuração
- `src/app/service/config.service.ts` - Serviço centralizado para acessar configurações

## Como Usar

### 1. Configurar URLs da API

Edite os arquivos de ambiente conforme necessário:

```typescript
// src/environments/environment.development.ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api',  // Sua API local
  apiTimeout: 30000
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.seudominio.com/api',  // Sua API de produção
  apiTimeout: 30000
};
```

### 2. Usar o ConfigService nos Serviços

```typescript
import { ConfigService } from './config.service';

@Injectable()
export class MeuService {
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  getData() {
    return this.http.get(this.configService.getApiUrl('/meu-endpoint'));
  }
}
```

### 3. Comandos de Build

```bash
# Desenvolvimento
ng serve --configuration=development

# Produção
ng build --configuration=production
```

## Vantagens

- ✅ Configurações centralizadas
- ✅ Diferentes ambientes (dev, prod, etc.)
- ✅ Fácil manutenção
- ✅ Type-safe
- ✅ Sem hardcoding de URLs
- ✅ Configuração automática baseada no ambiente

## Adicionando Novas Configurações

1. Adicione a propriedade nos arquivos de ambiente
2. Adicione o método correspondente no `ConfigService`
3. Use o serviço onde necessário

Exemplo:
```typescript
// environment.ts
export const environment = {
  // ... outras configs
  maxRetries: 3
};

// config.service.ts
getMaxRetries(): number {
  return environment.maxRetries;
}
```
