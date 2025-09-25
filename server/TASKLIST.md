# Service Migration Task List

## Overview
Migrate 15 client-side services to Fastify server to improve performance, security, and maintainability. Focus on **simple, direct migration** first - maintain current feature parity, then polish later.

## Priority Classification
- **P0 (Critical)**: Core business logic, heavy operations
- **P1 (High)**: Frequently used, moderate complexity  
- **P2 (Medium)**: Supporting functionality
- **P3 (Low)**: Simple operations, less frequently used

---

## Phase 1: Core Business Services (P0)

### 1. Program Service Migration
- **Priority**: P0 - Most complex, highest impact
- **File**: `program-service.ts` (620 lines, most complex)
- **Key Methods**: 
  - `createInterviews()` - 6+ DB operations, complex transaction logic
  - `getProgramById()` - Deep joins, data transformation
  - `createProgram()` - Multi-table creation with rollback
- **Endpoints to Create**:
  - `GET /api/programs` - Get all programs
  - `GET /api/programs/:id` - Get program by ID  
  - `POST /api/programs` - Create program
  - `PUT /api/programs/:id` - Update program
  - `DELETE /api/programs/:id` - Delete program
  - `POST /api/programs/:id/interviews` - Create interviews (most complex)
  - `GET /api/programs/:id/phase` - Get current phase
  - `POST /api/programs/:id/phases` - Create phase
  - `PUT /api/phases/:id` - Update phase
  - `DELETE /api/phases/:id` - Delete phase
- **Impact**: 40-60% speed improvement for complex program operations
- **Effort**: High (3-4 days)

### 2. Interview Service Migration  
- **Priority**: P0 - Heavy database operations
- **File**: `interview-service.ts` (2175 lines, heaviest file)
- **Key Methods**:
  - `getInterviews()` - Complex filtering, joins
  - `createInterview()` - Multi-step creation process
  - `getInterviewById()` - Deep nested queries
- **Endpoints to Create**:
  - `GET /api/interviews` - Get interviews with filters
  - `GET /api/interviews/:id` - Get interview details
  - `POST /api/interviews` - Create interview
  - `PUT /api/interviews/:id` - Update interview  
  - `DELETE /api/interviews/:id` - Delete interview
  - `POST /api/interviews/:id/responses` - Create response
  - `PUT /api/responses/:id` - Update response
  - `GET /api/interviews/:id/evidence` - Get evidence
  - `GET /api/interviews/public/:id` - Public interview access
- **Impact**: Major reduction in client-server round trips
- **Effort**: High (3-4 days)

---

## Phase 2: Data & Analytics Services (P1)

### 3. Assessment Service Migration
- **Priority**: P1 - Complex queries, used frequently
- **File**: `assessment-service.ts` (301 lines)
- **Key Methods**:
  - `getAssessments()` - Complex filtering, joins
  - `getAssessmentById()` - Nested data fetching
  - `createAssessment()` - Multi-table operations
- **Endpoints to Create**:
  - `GET /api/assessments` - Get assessments with filters  
  - `GET /api/assessments/:id` - Get assessment details
  - `POST /api/assessments` - Create assessment
  - `PUT /api/assessments/:id` - Update assessment
  - `DELETE /api/assessments/:id` - Delete assessment
  - `POST /api/assessments/:id/duplicate` - Duplicate assessment
  - `GET /api/questionnaires` - Get questionnaires
- **Impact**: Faster assessment loading and creation
- **Effort**: Medium (2 days)

### 4. Analytics Service Migration
- **Priority**: P1 - Heavy computational operations  
- **File**: `analytics-service.ts` (692 lines)
- **Key Methods**:
  - `getAssessmentMetrics()` - 4+ sequential DB calls
  - `getAssessmentProgress()` - Complex aggregations
  - `getSiteMapData()` - Geospatial data processing
- **Endpoints to Create**:
  - `GET /api/analytics/assessment/:id/progress` - Assessment progress
  - `GET /api/analytics/assessment/:id/metrics` - Complex metrics
  - `GET /api/analytics/sites/map` - Map visualization data
- **Impact**: 60-80% faster analytics loading
- **Effort**: Medium (2 days)

### 5. Metrics Service Migration
- **Priority**: P1 - Data aggregation operations
- **File**: `metrics-service.ts` (284 lines)  
- **Key Methods**:
  - `getProgramMetricsWithDefinitions()` - Joins and aggregations
  - `getCalculatedMetrics()` - Complex filtering
- **Endpoints to Create**:
  - `GET /api/metrics/definitions` - Get metric definitions
  - `GET /api/metrics/program/:id` - Program metrics
  - `POST /api/metrics/program/:programId/metric/:metricId` - Add metric
  - `DELETE /api/metrics/program/:programId/metric/:metricId` - Remove metric
  - `GET /api/metrics/calculated` - Calculated metrics
  - `POST /api/metrics/calculated` - Create calculated metric
- **Impact**: Faster metrics dashboard loading
- **Effort**: Medium (1-2 days)

---

## Phase 3: Supporting Services (P2)

### 6. Company Service Migration
- **Priority**: P2 - Tree operations, moderate complexity
- **File**: `company-service.ts` (751 lines)
- **Key Methods**:
  - `getCompanyTree()` - Deep hierarchical queries
  - `createTreeNode()` - Dynamic table operations
- **Endpoints to Create**:
  - `GET /api/companies` - Get companies
  - `GET /api/companies/:id/tree` - Company hierarchy 
  - `POST /api/companies` - Create company
  - `PUT /api/companies/:id` - Update company
  - `DELETE /api/companies/:id` - Delete company
  - `POST /api/companies/:id/nodes` - Create tree node
  - `PUT /api/nodes/:id` - Update tree node
  - `DELETE /api/nodes/:id` - Delete tree node
- **Impact**: Faster hierarchy loading
- **Effort**: Medium (2 days)

### 7. Recommendations Service Migration  
- **Priority**: P2 - Simple CRUD, moderate usage
- **File**: `recommendations-service.ts` (98 lines, simplest)
- **Key Methods**: Basic CRUD operations
- **Endpoints to Create**:
  - `GET /api/recommendations` - Get recommendations
  - `GET /api/recommendations/:id` - Get recommendation
  - `POST /api/recommendations` - Create recommendation
  - `PUT /api/recommendations/:id` - Update recommendation  
  - `DELETE /api/recommendations/:id` - Delete recommendation
- **Impact**: Minimal (already simple)
- **Effort**: Low (0.5 days)

---

## Phase 4: Remaining Services (P3)

### 8-15. Other Services (Batch Migration)
- **Services**: contact-service, questionnaire-service, roles-service, evidence-service, program-objectives-service, program-scope-service 
- **Priority**: P3 - Supporting functionality, lower complexity
- **Approach**: Batch migrate with standard CRUD patterns
- **Effort**: Low-Medium (1-2 days total)

---

## Implementation Approach

### Step 1: Setup Service Structure
```
server/src/
├── routes/
│   ├── programs.ts
│   ├── interviews.ts  
│   ├── assessments.ts
│   ├── analytics.ts
│   ├── metrics.ts
│   └── ...
├── services/
│   ├── ProgramService.ts
│   ├── InterviewService.ts
│   └── ...
└── types/
    └── api.ts
```

### Step 2: Migration Pattern (Keep It Simple)
1. **Copy existing service class** to `server/src/services/`
2. **Add Fastify route handlers** in `server/src/routes/`  
3. **Create simple API endpoints** - no fancy restructuring
4. **Update client calls** to use API endpoints
5. **Test basic functionality**
6. **Polish and optimize later**

### Step 3: Client-Side Changes
- Replace service class calls with fetch/axios API calls
- Update React Query hooks to use API endpoints
- Add proper error handling
- Maintain existing component interfaces

---

## Success Metrics

### Performance Goals
- **Bundle Size**: 60-80% reduction (remove ~2MB of service code)
- **Complex Operations**: 40-60% faster (fewer round trips)
- **Initial Load**: 30-50% faster (smaller bundle)

### Quality Goals  
- **Feature Parity**: 100% - no functionality lost
- **Error Handling**: Improved server-side error responses
- **Security**: Better separation of concerns
- **Maintainability**: Centralized business logic

---

## Timeline Estimate
- **Phase 1 (P0)**: 6-8 days
- **Phase 2 (P1)**: 5-7 days  
- **Phase 3 (P2)**: 2-3 days
- **Phase 4 (P3)**: 1-2 days
- **Client Updates**: 3-4 days
- **Testing & Polish**: 2-3 days

**Total: 3-4 weeks**

---

## Next Steps
1. Start with **Program Service** (highest impact)
2. Set up route structure and basic patterns
3. Migrate one method at a time
4. Test incrementally
5. Move to Interview Service once pattern is established