# Guardian Backend - High-Level Design (HLD)

## 📋 **Project Overview**

**Project Name**: Guardian Backend  
**Technology**: Strapi v4 (Headless CMS)  
**Purpose**: Backend API for Guardian Cybersecurity Case Management System  
**Client**: CyberMitra  
**Architecture**: RESTful API with GraphQL support  

---

## 🎯 **System Objectives**

### **Primary Goals**
- Provide secure, scalable API for case management
- Handle user authentication and authorization
- Manage cybersecurity case lifecycle
- Generate reports and analytics
- Real-time alert management
- Audit trail and compliance tracking

### **Non-Functional Requirements**
- **Performance**: <200ms API response time
- **Security**: JWT authentication, RBAC, data encryption
- **Scalability**: Support 1000+ concurrent users
- **Availability**: 99.9% uptime
- **Compliance**: Data privacy regulations

---

## 🏗️ **System Architecture**

### **Architecture Pattern**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   Mobile App    │    │  Admin Panel    │
│   (Frontend)    │    │   (Future)      │    │   (Strapi)      │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼───────────────┐
                    │      API Gateway           │
                    │    (Strapi Backend)        │
                    └─────────────┬───────────────┘
                                  │
                    ┌─────────────▼───────────────┐
                    │     Database Layer         │
                    │    (PostgreSQL/MySQL)      │
                    └─────────────────────────────┘
```

### **Technology Stack**
- **Backend Framework**: Strapi v4
- **Database**: PostgreSQL (Production) / SQLite (Development)
- **Authentication**: JWT + Strapi Users & Permissions
- **File Storage**: AWS S3 / Cloudinary
- **Email Service**: SendGrid / Nodemailer
- **Deployment**: Railway / Heroku / DigitalOcean
- **Monitoring**: Strapi Analytics + Custom logging

---

## 📊 **Data Model Design**

### **Core Entities**

#### **1. Users Collection**
```javascript
{
  id: "uuid",
  username: "string",
  email: "string",
  password: "string", // hashed
  firstName: "string",
  lastName: "string",
  role: "relation", // Admin, Investigator, Analyst
  department: "string",
  phone: "string",
  isActive: "boolean",
  lastLogin: "datetime",
  createdAt: "datetime",
  updatedAt: "datetime"
}
```

#### **2. Cases Collection**
```javascript
{
  id: "uuid",
  caseId: "string", // CAS-001, CAS-002
  title: "string",
  description: "text",
  status: "enumeration", // unverified, active, closed, archived
  priority: "enumeration", // high, medium, low
  caseType: "enumeration", // phishing, romance-scam, investment-fraud, etc.
  amountInvolved: "decimal",
  currency: "string",
  dateOpened: "date",
  dateClosed: "date",
  assignedTo: "relation", // User
  createdBy: "relation", // User
  victim: "relation", // Victim
  evidence: "relation", // Evidence (one-to-many)
  timeline: "relation", // Timeline (one-to-many)
  notes: "relation", // Notes (one-to-many)
  tags: "json",
  metadata: "json",
  createdAt: "datetime",
  updatedAt: "datetime"
}
```

#### **3. Victims Collection**
```javascript
{
  id: "uuid",
  firstName: "string",
  lastName: "string",
  email: "string",
  phone: "string",
  address: "text",
  company: "string",
  jobTitle: "string",
  dateOfBirth: "date",
  nationality: "string",
  identificationNumber: "string",
  contactPreference: "enumeration", // email, phone, both
  isVerified: "boolean",
  cases: "relation", // Cases (one-to-many)
  createdAt: "datetime",
  updatedAt: "datetime"
}
```

#### **4. Evidence Collection**
```javascript
{
  id: "uuid",
  case: "relation", // Case
  title: "string",
  description: "text",
  evidenceType: "enumeration", // document, screenshot, email, financial, digital
  files: "media", // Multiple files
  hash: "string", // File integrity
  collectedBy: "relation", // User
  collectionDate: "datetime",
  source: "string",
  isVerified: "boolean",
  metadata: "json",
  createdAt: "datetime",
  updatedAt: "datetime"
}
```

#### **5. Timeline Collection**
```javascript
{
  id: "uuid",
  case: "relation", // Case
  title: "string",
  description: "text",
  eventType: "enumeration", // incident, investigation, communication, resolution
  eventDate: "datetime",
  addedBy: "relation", // User
  isPublic: "boolean", // Visible to victim
  attachments: "media",
  createdAt: "datetime",
  updatedAt: "datetime"
}
```

#### **6. Alerts Collection**
```javascript
{
  id: "uuid",
  title: "string",
  description: "text",
  alertType: "enumeration", // security, system, case-update, deadline
  severity: "enumeration", // critical, high, medium, low
  status: "enumeration", // new, acknowledged, resolved, dismissed
  triggeredBy: "string", // system, user, external
  assignedTo: "relation", // User
  relatedCase: "relation", // Case (optional)
  metadata: "json",
  acknowledgedAt: "datetime",
  resolvedAt: "datetime",
  createdAt: "datetime",
  updatedAt: "datetime"
}
```

#### **7. Reports Collection**
```javascript
{
  id: "uuid",
  title: "string",
  reportType: "enumeration", // case-summary, monthly, quarterly, custom
  description: "text",
  generatedBy: "relation", // User
  parameters: "json", // Filter criteria
  data: "json", // Report data
  format: "enumeration", // pdf, excel, json
  filePath: "string",
  isScheduled: "boolean",
  scheduleConfig: "json",
  createdAt: "datetime",
  updatedAt: "datetime"
}
```

#### **8. Notes Collection**
```javascript
{
  id: "uuid",
  case: "relation", // Case
  content: "text",
  noteType: "enumeration", // investigation, communication, internal, public
  addedBy: "relation", // User
  isPrivate: "boolean",
  attachments: "media",
  createdAt: "datetime",
  updatedAt: "datetime"
}
```

#### **9. Audit Log Collection**
```javascript
{
  id: "uuid",
  action: "string", // create, update, delete, view
  entityType: "string", // case, user, evidence
  entityId: "string",
  userId: "relation", // User
  ipAddress: "string",
  userAgent: "string",
  changes: "json", // Before/after values
  timestamp: "datetime"
}
```

---

## 🔐 **Authentication & Authorization**

### **Authentication Strategy**
- **JWT Tokens**: Access tokens (15 min) + Refresh tokens (7 days)
- **Password Policy**: Min 8 chars, uppercase, lowercase, number, special char
- **2FA Support**: Optional TOTP authentication
- **Session Management**: Track active sessions per user

### **Role-Based Access Control (RBAC)**

#### **Roles Definition**
```javascript
// Super Admin
{
  name: "Super Admin",
  permissions: ["*"], // All permissions
  description: "Full system access"
}

// Admin
{
  name: "Admin",
  permissions: [
    "cases.*", "users.read", "users.update", 
    "reports.*", "alerts.*", "settings.*"
  ]
}

// Senior Investigator
{
  name: "Senior Investigator",
  permissions: [
    "cases.*", "evidence.*", "timeline.*", 
    "notes.*", "reports.read", "alerts.read"
  ]
}

// Investigator
{
  name: "Investigator",
  permissions: [
    "cases.read", "cases.update", "evidence.*", 
    "timeline.*", "notes.*", "own-cases.*"
  ]
}

// Analyst
{
  name: "Analyst",
  permissions: [
    "cases.read", "reports.*", "alerts.read",
    "evidence.read", "timeline.read"
  ]
}

// Viewer
{
  name: "Viewer",
  permissions: [
    "cases.read", "reports.read", "alerts.read"
  ]
}
```

### **Permission Matrix**
| Resource | Super Admin | Admin | Sr. Investigator | Investigator | Analyst | Viewer |
|----------|-------------|-------|------------------|--------------|---------|--------|
| Cases    | CRUD        | CRUD  | CRUD             | RU (own)     | R       | R      |
| Users    | CRUD        | RU    | R                | R (limited)  | R       | R      |
| Evidence | CRUD        | CRUD  | CRUD             | CRUD         | R       | R      |
| Reports  | CRUD        | CRUD  | R                | R            | CRUD    | R      |
| Alerts   | CRUD        | CRUD  | R                | R            | R       | R      |
| Settings | CRUD        | CRUD  | -                | -            | -       | -      |

---

## 🔌 **API Design**

### **RESTful API Endpoints**

#### **Authentication Endpoints**
```
POST   /api/auth/local               # Login
POST   /api/auth/register            # Register
POST   /api/auth/refresh             # Refresh token
POST   /api/auth/forgot-password     # Password reset
POST   /api/auth/reset-password      # Confirm password reset
POST   /api/auth/logout              # Logout
GET    /api/auth/me                  # Get current user
```

#### **Cases API**
```
GET    /api/cases                    # List cases (with filters)
POST   /api/cases                    # Create case
GET    /api/cases/:id                # Get case details
PUT    /api/cases/:id                # Update case
DELETE /api/cases/:id                # Delete case
POST   /api/cases/:id/assign         # Assign case to user
POST   /api/cases/:id/verify         # Verify case (unverified → active)
GET    /api/cases/:id/timeline       # Get case timeline
GET    /api/cases/:id/evidence       # Get case evidence
GET    /api/cases/:id/notes          # Get case notes
```

#### **Users API**
```
GET    /api/users                    # List users
POST   /api/users                    # Create user
GET    /api/users/:id                # Get user details
PUT    /api/users/:id                # Update user
DELETE /api/users/:id                # Deactivate user
PUT    /api/users/:id/role           # Update user role
GET    /api/users/:id/cases          # Get user's cases
```

#### **Evidence API**
```
GET    /api/evidence                 # List evidence
POST   /api/evidence                 # Upload evidence
GET    /api/evidence/:id             # Get evidence details
PUT    /api/evidence/:id             # Update evidence
DELETE /api/evidence/:id             # Delete evidence
POST   /api/evidence/:id/verify      # Verify evidence integrity
```

#### **Alerts API**
```
GET    /api/alerts                   # List alerts
POST   /api/alerts                   # Create alert
GET    /api/alerts/:id               # Get alert details
PUT    /api/alerts/:id               # Update alert
DELETE /api/alerts/:id               # Delete alert
POST   /api/alerts/:id/acknowledge   # Acknowledge alert
POST   /api/alerts/:id/resolve       # Resolve alert
```

#### **Reports API**
```
GET    /api/reports                  # List reports
POST   /api/reports                  # Generate report
GET    /api/reports/:id              # Get report details
DELETE /api/reports/:id              # Delete report
GET    /api/reports/:id/download     # Download report file
POST   /api/reports/schedule         # Schedule recurring report
```

### **Query Parameters & Filtering**
```javascript
// Cases filtering
GET /api/cases?status=active&priority=high&assignedTo=123&page=1&limit=20

// Search functionality
GET /api/cases?search=phishing&sortBy=dateOpened&sortOrder=desc

// Date range filtering
GET /api/cases?dateFrom=2024-01-01&dateTo=2024-12-31

// Advanced filtering
GET /api/cases?filters[status][$in]=active,unverified&filters[priority][$ne]=low
```

---

## 🔧 **Strapi Configuration**

### **Project Structure**
```
guardian-backend/
├── config/
│   ├── database.js              # Database configuration
│   ├── server.js                # Server settings
│   ├── admin.js                 # Admin panel config
│   ├── api.js                   # API settings
│   └── plugins.js               # Plugin configurations
├── src/
│   ├── api/                     # API endpoints
│   │   ├── case/
│   │   ├── user/
│   │   ├── evidence/
│   │   ├── alert/
│   │   └── report/
│   ├── components/              # Reusable components
│   ├── extensions/              # Core extensions
│   ├── middlewares/             # Custom middlewares
│   ├── plugins/                 # Custom plugins
│   └── policies/                # Custom policies
├── public/                      # Static files
├── database/
│   └── migrations/              # Database migrations
├── .env                         # Environment variables
├── package.json
└── README.md
```

### **Environment Configuration**
```bash
# .env file
NODE_ENV=development
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-app-keys
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
TRANSFER_TOKEN_SALT=your-transfer-token-salt
JWT_SECRET=your-jwt-secret

# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=guardian_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_SSL=false

# File Upload
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_KEY=your-cloudinary-key
CLOUDINARY_SECRET=your-cloudinary-secret

# Email
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=your-sendgrid-api-key
EMAIL_DEFAULT_FROM=noreply@cybermitra.com

# Security
CORS_ORIGIN=http://localhost:3000,https://guardian.cybermitra.com
```

### **Custom Middlewares**
```javascript
// src/middlewares/audit-log.js
module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    await next();
    
    // Log all API actions for audit trail
    if (ctx.method !== 'GET' && ctx.state.user) {
      await strapi.entityService.create('api::audit-log.audit-log', {
        data: {
          action: ctx.method,
          entityType: ctx.params.model,
          entityId: ctx.params.id,
          userId: ctx.state.user.id,
          ipAddress: ctx.request.ip,
          userAgent: ctx.request.header['user-agent'],
          changes: ctx.request.body
        }
      });
    }
  };
};
```

### **Custom Policies**
```javascript
// src/policies/is-case-owner.js
module.exports = async (policyContext, config, { strapi }) => {
  const { user } = policyContext.state;
  const { id } = policyContext.params;
  
  if (user.role.name === 'Super Admin' || user.role.name === 'Admin') {
    return true;
  }
  
  const case_ = await strapi.entityService.findOne('api::case.case', id, {
    populate: ['assignedTo']
  });
  
  return case_?.assignedTo?.id === user.id;
};
```

---

## 📈 **Performance Optimization**

### **Database Optimization**
- **Indexing Strategy**: Index on frequently queried fields (caseId, status, assignedTo)
- **Query Optimization**: Use populate wisely, implement pagination
- **Connection Pooling**: Configure database connection limits
- **Caching**: Redis for session storage and frequent queries

### **API Performance**
- **Response Compression**: Enable gzip compression
- **Rate Limiting**: Implement API rate limiting
- **Pagination**: Default page size of 20, max 100
- **Field Selection**: Allow clients to specify required fields

### **File Handling**
- **Upload Limits**: Max 50MB per file, 200MB per request
- **File Validation**: Type checking, virus scanning
- **CDN Integration**: Use Cloudinary/AWS S3 for file storage
- **Image Optimization**: Auto-resize and compress images

---

## 🛡️ **Security Measures**

### **Data Protection**
- **Encryption**: AES-256 for sensitive data at rest
- **HTTPS Only**: Force SSL in production
- **Input Validation**: Joi/Yup validation schemas
- **SQL Injection**: Use Strapi's built-in ORM protection
- **XSS Protection**: Sanitize user inputs

### **API Security**
- **CORS Configuration**: Restrict origins to known domains
- **Rate Limiting**: 100 requests/minute per IP
- **JWT Security**: Short-lived access tokens
- **API Versioning**: Version APIs for backward compatibility

### **Audit & Compliance**
- **Audit Logging**: Log all data access and modifications
- **Data Retention**: Configurable retention policies
- **GDPR Compliance**: Data export and deletion capabilities
- **Backup Strategy**: Daily automated backups

---

## 🚀 **Deployment Strategy**

### **Development Environment**
```bash
# Local development
npm run develop     # Start Strapi in development mode
npm run build       # Build admin panel
npm run start       # Start in production mode
```

### **Production Deployment**

#### **Option 1: Railway (Recommended)**
```yaml
# railway.toml
[build]
builder = "nixpacks"

[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 100
restartPolicyType = "on_failure"

[env]
NODE_ENV = "production"
```

#### **Option 2: Docker Deployment**
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 1337
CMD ["npm", "start"]
```

### **CI/CD Pipeline**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm test
      - name: Deploy to Railway
        run: railway deploy
```

---

## 📊 **Monitoring & Analytics**

### **Health Monitoring**
- **Health Check Endpoint**: `/api/health`
- **Database Connection**: Monitor connection pool
- **Memory Usage**: Track memory consumption
- **Response Times**: Monitor API performance

### **Business Metrics**
- **Case Metrics**: Cases created, resolved, average resolution time
- **User Activity**: Login frequency, active users
- **System Usage**: API calls, storage usage
- **Error Tracking**: 4xx/5xx error rates

### **Logging Strategy**
```javascript
// Custom logger configuration
module.exports = {
  level: 'info',
  format: 'json',
  transports: [
    { type: 'console' },
    { type: 'file', filename: 'logs/app.log' },
    { type: 'file', filename: 'logs/error.log', level: 'error' }
  ]
};
```

---

## 🔄 **Data Migration & Seeding**

### **Initial Data Seeding**
```javascript
// database/seeds/initial-data.js
module.exports = {
  async run() {
    // Create default roles
    await createDefaultRoles();
    
    // Create admin user
    await createAdminUser();
    
    // Create sample cases for demo
    await createSampleCases();
    
    // Setup default settings
    await setupDefaultSettings();
  }
};
```

### **Migration Strategy**
- **Version Control**: Track schema changes
- **Rollback Plan**: Ability to rollback migrations
- **Data Validation**: Validate data integrity after migrations
- **Zero-Downtime**: Use blue-green deployment for migrations

---

## 🧪 **Testing Strategy**

### **Test Types**
- **Unit Tests**: Test individual functions and utilities
- **Integration Tests**: Test API endpoints
- **E2E Tests**: Test complete user workflows
- **Performance Tests**: Load testing for scalability

### **Test Configuration**
```javascript
// tests/helpers/strapi.js
const Strapi = require('@strapi/strapi');

let instance;

async function setupStrapi() {
  if (!instance) {
    instance = await Strapi().load();
  }
  return instance;
}

module.exports = { setupStrapi };
```

---

## 📝 **Documentation Plan**

### **API Documentation**
- **OpenAPI/Swagger**: Auto-generated API docs
- **Postman Collection**: Ready-to-use API collection
- **Code Examples**: Sample requests/responses
- **Authentication Guide**: How to authenticate

### **Developer Documentation**
- **Setup Guide**: Local development setup
- **Architecture Overview**: System design explanation
- **Contribution Guidelines**: Code standards and practices
- **Deployment Guide**: Production deployment steps

---

## 🎯 **Success Metrics**

### **Technical KPIs**
- **API Response Time**: <200ms average
- **Uptime**: 99.9% availability
- **Error Rate**: <1% of requests
- **Database Performance**: <100ms query time

### **Business KPIs**
- **User Adoption**: 90% of target users active
- **Case Processing**: 50% faster case resolution
- **Data Accuracy**: 99% data integrity
- **User Satisfaction**: >4.5/5 rating

---

## 🗓️ **Implementation Timeline**

### **Phase 1: Foundation (Week 1-2)**
- [ ] Project setup and configuration
- [ ] Database schema implementation
- [ ] Basic authentication system
- [ ] Core API endpoints (CRUD operations)

### **Phase 2: Core Features (Week 3-4)**
- [ ] Case management workflow
- [ ] User role and permissions
- [ ] File upload and evidence handling
- [ ] Basic reporting functionality

### **Phase 3: Advanced Features (Week 5-6)**
- [ ] Real-time alerts system
- [ ] Advanced search and filtering
- [ ] Audit logging
- [ ] Email notifications

### **Phase 4: Production Ready (Week 7-8)**
- [ ] Security hardening
- [ ] Performance optimization
- [ ] Testing and QA
- [ ] Deployment and monitoring

---

## 🔗 **Integration Points**

### **Frontend Integration**
- **API Client**: Axios-based API client library
- **Authentication**: JWT token management
- **Real-time Updates**: WebSocket for live notifications
- **File Uploads**: Direct upload to cloud storage

### **External Services**
- **Email Service**: SendGrid for notifications
- **File Storage**: Cloudinary for evidence files
- **Analytics**: Custom analytics dashboard
- **Backup Service**: Automated backup to cloud storage

---

This HLD provides a comprehensive blueprint for implementing the Guardian backend using Strapi. The design focuses on security, scalability, and maintainability while providing all the features needed for effective cybersecurity case management. 