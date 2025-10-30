# Drag-and-Drop Implementation Plan for Questionnaire Tree Structure

## Overview

This document outlines the complete implementation plan for adding drag-and-drop reordering functionality to the hierarchical questionnaire tree structure using dnd-kit.

**Goal:** Enable users to reorder sections, steps, and questions within the questionnaire editor using intuitive drag-and-drop interactions, with proper constraints to maintain data integrity.

**Estimated Effort:** 3-5 days

---

## Current State

### Infrastructure (Already Complete ✅)

- **Database:** All three levels (sections, steps, questions) have `order_index` fields
- **Types:** TypeScript types include order_index in all relevant interfaces
- **API Methods:** Update hooks support partial updates including order_index
- **Pattern:** Existing `reorderQuestionParts` API demonstrates the pattern to follow

### What's Missing

- dnd-kit library installation
- Drag-and-drop UI implementation for all three levels
- Reorder API endpoints for sections, steps, and questions
- Constraint logic to prevent invalid drag operations
- Visual indicators for drag handles and drop zones

---

## Technical Approach

### Library Choice: @dnd-kit

**Packages to install:**
```json
{
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

**Why @dnd-kit:**
- Purpose-built for sortable lists and trees
- Excellent TypeScript support
- Supports nested sortable contexts (critical for 3-level hierarchy)
- Accessible out of the box
- Well-maintained and widely adopted
- Smaller bundle size than alternatives for this use case

### Architecture Pattern

Use **nested `SortableContext`** components:

```
<SortableContext items={sections}> {/* Level 1 */}
  {sections.map(section => (
    <SortableSection>
      <SortableContext items={section.steps}> {/* Level 2 */}
        {steps.map(step => (
          <SortableStep>
            <SortableContext items={step.questions}> {/* Level 3 */}
              {questions.map(question => (
                <SortableQuestion />
              ))}
            </SortableContext>
          </SortableStep>
        ))}
      </SortableContext>
    </SortableSection>
  ))}
</SortableContext>
```

---

## Implementation Steps

### Phase 1: Setup and Infrastructure (Day 1 - Morning)

#### 1.1 Install Dependencies (1 hour)

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Update package.json and verify installation.

#### 1.2 Create Reorder API Endpoints (3-4 hours)

**Backend Routes to Add:**

```typescript
// File: server/src/routes/questionnaires/sections.ts
PUT /questionnaires/:questionnaireId/sections/reorder
Body: { sectionIdsInOrder: number[] }

// File: server/src/routes/questionnaires/steps.ts
PUT /questionnaires/sections/:sectionId/steps/reorder
Body: { stepIdsInOrder: number[] }

// File: server/src/routes/questionnaires/questions.ts
PUT /questionnaires/steps/:stepId/questions/reorder
Body: { questionIdsInOrder: number[] }
```

**Client API Methods to Add:**

File: `src/lib/api/questionnaires.ts`

```typescript
export async function reorderSections(
  questionnaireId: number,
  sectionIdsInOrder: number[]
): Promise<void> {
  await client.put(
    `/questionnaires/${questionnaireId}/sections/reorder`,
    { sectionIdsInOrder }
  );
}

export async function reorderSteps(
  sectionId: number,
  stepIdsInOrder: number[]
): Promise<void> {
  await client.put(
    `/questionnaires/sections/${sectionId}/steps/reorder`,
    { stepIdsInOrder }
  );
}

export async function reorderQuestions(
  stepId: number,
  questionIdsInOrder: number[]
): Promise<void> {
  await client.put(
    `/questionnaires/steps/${stepId}/questions/reorder`,
    { questionIdsInOrder }
  );
}
```

**Backend Implementation Pattern:**

Follow the existing `reorderQuestionParts` pattern (src/lib/api/questionnaires.ts:845-870):

1. Accept array of IDs in desired order
2. Validate all IDs belong to the parent entity
3. Update `order_index` for each entity based on array position
4. Handle transaction rollback on errors

---

### Phase 2: Component Implementation (Day 1 Afternoon - Day 3)

#### 2.1 Create Sortable Wrapper Components (2-3 hours)

**File:** `src/components/questionnaires/detail/questions/sortable-wrappers.tsx`

Create three wrapper components:

```typescript
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableSection({
  id,
  children
}: {
  id: number;
  children: React.ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {/* Drag handle */}
      <div {...attributes} {...listeners} className="drag-handle">
        <GripVertical className="h-4 w-4" />
      </div>
      {children}
    </div>
  );
}

// Similar implementations for SortableStep and SortableQuestion
```

#### 2.2 Implement Question-Level Drag-and-Drop (5-6 hours)

**File:** `src/components/questionnaires/detail/questions/index.tsx`

**Changes required:**

1. Import dnd-kit dependencies
2. Wrap questions list with `SortableContext`
3. Replace question div with `SortableQuestion` wrapper
4. Add `handleQuestionsReorder` function
5. Integrate with React Query for optimistic updates

**Key code changes:**

```typescript
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';

// Inside Questions component:
const handleQuestionsReorder = async (event: DragEndEvent, stepId: number) => {
  const { active, over } = event;

  if (!over || active.id === over.id) return;

  // Find the step
  const step = sections
    .flatMap(s => s.steps)
    .find(s => s.id === stepId);

  if (!step) return;

  const oldIndex = step.questions.findIndex(q => q.id === Number(active.id));
  const newIndex = step.questions.findIndex(q => q.id === Number(over.id));

  const reorderedQuestions = arrayMove(step.questions, oldIndex, newIndex);
  const questionIds = reorderedQuestions.map(q => q.id);

  // Optimistic update via React Query
  await reorderQuestions(stepId, questionIds);
};

// In JSX where questions are mapped:
{expandedNodes.has(step.id) && (
  <DndContext
    collisionDetection={closestCenter}
    onDragEnd={(event) => handleQuestionsReorder(event, step.id)}
  >
    <SortableContext
      items={step.questions.map(q => q.id.toString())}
      strategy={verticalListSortingStrategy}
    >
      {step.questions.map((question, questionIndex) => (
        <SortableQuestion key={question.id} id={question.id}>
          {/* Existing question rendering code */}
        </SortableQuestion>
      ))}
    </SortableContext>
  </DndContext>
)}
```

#### 2.3 Implement Step-Level Drag-and-Drop (4-6 hours)

**File:** `src/components/questionnaires/detail/questions/index.tsx`

Similar pattern to questions, but:
- Wrap steps within each section
- Handle `handleStepsReorder` with sectionId parameter
- Ensure nested question contexts still work

```typescript
const handleStepsReorder = async (event: DragEndEvent, sectionId: number) => {
  const { active, over } = event;

  if (!over || active.id === over.id) return;

  const section = sections.find(s => s.id === sectionId);
  if (!section) return;

  const oldIndex = section.steps.findIndex(s => s.id === Number(active.id));
  const newIndex = section.steps.findIndex(s => s.id === Number(over.id));

  const reorderedSteps = arrayMove(section.steps, oldIndex, newIndex);
  const stepIds = reorderedSteps.map(s => s.id);

  await reorderSteps(sectionId, stepIds);
};
```

#### 2.4 Implement Section-Level Drag-and-Drop (3-4 hours)

**File:** `src/components/questionnaires/detail/questions/index.tsx`

Top-level sortable context:

```typescript
const handleSectionsReorder = async (event: DragEndEvent) => {
  const { active, over } = event;

  if (!over || active.id === over.id) return;

  const oldIndex = sections.findIndex(s => s.id === Number(active.id));
  const newIndex = sections.findIndex(s => s.id === Number(over.id));

  const reorderedSections = arrayMove(sections, oldIndex, newIndex);
  const sectionIds = reorderedSections.map(s => s.id);

  await reorderSections(questionnaire.id, sectionIds);
};

// Wrap entire sections map
<DndContext
  collisionDetection={closestCenter}
  onDragEnd={handleSectionsReorder}
>
  <SortableContext
    items={sections.map(s => s.id.toString())}
    strategy={verticalListSortingStrategy}
  >
    {sections.map((section) => (
      <SortableSection key={section.id} id={section.id}>
        {/* Existing section and nested step/question code */}
      </SortableSection>
    ))}
  </SortableContext>
</DndContext>
```

---

### Phase 3: Constraints and Validation (Day 3 Afternoon - Day 4)

#### 3.1 Implement Drag Constraints (3-4 hours)

**Prevent cross-context dragging:**

Use dnd-kit's collision detection and data attributes:

```typescript
// Add data to each sortable item
const { attributes } = useSortable({
  id: id.toString(),
  data: {
    type: 'question', // or 'step' or 'section'
    parentId: stepId, // or sectionId, or questionnaireId
  }
});

// Custom collision detection
function customCollisionDetection(args) {
  const { active, droppableContainers } = args;

  // Filter droppable containers to only allow same type and parent
  const filteredContainers = droppableContainers.filter(container => {
    const activeData = active.data.current;
    const containerData = container.data.current;

    return (
      activeData?.type === containerData?.type &&
      activeData?.parentId === containerData?.parentId
    );
  });

  return closestCenter({
    ...args,
    droppableContainers: filteredContainers,
  });
}
```

#### 3.2 Add Visual Indicators (2-3 hours)

**Drag handles:**

Add grip icon that only shows on hover:

```typescript
{userCanAdmin && (
  <div
    className="drag-handle opacity-0 group-hover:opacity-100 transition-opacity"
    {...listeners}
    {...attributes}
  >
    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
  </div>
)}
```

**Drop zones:**

Add visual feedback using dnd-kit's `isOver` state:

```typescript
const { isOver } = useSortable({ id });

className={`
  ${isOver ? 'bg-primary/10 border-primary' : ''}
  transition-colors
`}
```

**Dragging state:**

Reduce opacity of dragged item:

```typescript
style={{
  ...style,
  opacity: isDragging ? 0.5 : 1,
  cursor: isDragging ? 'grabbing' : 'grab',
}}
```

---

### Phase 4: React Query Integration (Day 4 Afternoon)

#### 4.1 Optimistic Updates (2-3 hours)

**File:** `src/hooks/questionnaire/useQuestions.ts`

Add reorder mutations with optimistic updates:

```typescript
export function useReorderQuestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ stepId, questionIds }: {
      stepId: number;
      questionIds: number[]
    }) => reorderQuestions(stepId, questionIds),

    onMutate: async ({ stepId, questionIds }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['questionnaire'] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(['questionnaire']);

      // Optimistically update cache
      queryClient.setQueryData(['questionnaire'], (old: any) => {
        // Update the questions order in the cached data
        // ... implementation
      });

      return { previousData };
    },

    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['questionnaire'], context.previousData);
      toast.error('Failed to reorder questions');
    },

    onSettled: () => {
      // Refetch to ensure sync
      queryClient.invalidateQueries({ queryKey: ['questionnaire'] });
    },
  });
}

// Similar implementations for useReorderSteps and useReorderSections
```

---

### Phase 5: Edge Cases and Testing (Day 5)

#### 5.1 Handle Edge Cases (2-3 hours)

**Test and fix:**

1. **Empty lists:** Ensure drag-and-drop works when only 1 item exists
2. **Collapsed sections:** Disable dragging steps/questions when parent is collapsed
3. **Processing state:** Disable drag during API calls (use `isProcessing` flag)
4. **Concurrent edits:** Handle optimistic update conflicts
5. **Deleted items:** Ensure soft-deleted items don't break reordering
6. **Permission checks:** Only show drag handles when `userCanAdmin` is true

**Implementation:**

```typescript
// Disable drag when collapsed
const { listeners, attributes } = useSortable({
  id,
  disabled: !expandedNodes.has(parentId) || isProcessing,
});

// Conditional drag handle rendering
{userCanAdmin && !isProcessing && (
  <div {...listeners} {...attributes}>
    <GripVertical />
  </div>
)}
```

#### 5.2 Testing Strategy (3-4 hours)

**Manual testing checklist:**

- [ ] Drag question within step (should work)
- [ ] Drag question to different step (should fail/be prevented)
- [ ] Drag step within section (should work)
- [ ] Drag step to different section (should fail/be prevented)
- [ ] Drag section within questionnaire (should work)
- [ ] Reorder with collapsed sections (should work at section level only)
- [ ] Reorder while another user edits (optimistic update test)
- [ ] Network failure during reorder (should rollback)
- [ ] Rapid successive reorders (debouncing test)
- [ ] Keyboard accessibility (Tab to handle, Space/Enter to activate)
- [ ] Screen reader announcements (aria-labels)

**Automated tests to add:**

File: `src/components/questionnaires/detail/questions/index.test.tsx`

```typescript
describe('Questionnaire Drag-and-Drop', () => {
  it('reorders questions within a step', async () => {
    // Test implementation
  });

  it('prevents questions from being dragged to different steps', async () => {
    // Test implementation
  });

  it('reorders steps within a section', async () => {
    // Test implementation
  });

  // ... more tests
});
```

---

## File Structure

### New Files to Create

```
src/components/questionnaires/detail/questions/
  ├── sortable-wrappers.tsx          (NEW - Sortable components)
  └── drag-constraints.ts            (NEW - Constraint logic)

src/hooks/questionnaire/
  └── useReorder.ts                  (NEW - Reorder mutations)

server/src/routes/questionnaires/
  ├── sections.ts                    (MODIFY - Add reorder endpoint)
  ├── steps.ts                       (MODIFY - Add reorder endpoint)
  └── questions.ts                   (MODIFY - Add reorder endpoint)
```

### Files to Modify

```
src/components/questionnaires/detail/questions/
  └── index.tsx                      (MODIFY - Add DndContext)

src/lib/api/questionnaires.ts       (MODIFY - Add reorder methods)

src/hooks/questionnaire/
  └── useQuestions.ts                (MODIFY - Export reorder hooks)

package.json                         (MODIFY - Add dependencies)
```

---

## Constraint Matrix

| Source Type | Can Drop Into | Cannot Drop Into |
|-------------|---------------|------------------|
| Question    | Same step only | Different step, section level |
| Step        | Same section only | Different section, question level |
| Section     | Same questionnaire | Question level, step level |

---

## Visual Design Considerations

### Drag Handle Styling

```css
.drag-handle {
  opacity: 0;
  transition: opacity 200ms;
  cursor: grab;
}

.group:hover .drag-handle {
  opacity: 1;
}

.drag-handle:active {
  cursor: grabbing;
}
```

### Drop Zone Indicators

```css
.drop-zone-active {
  border: 2px dashed hsl(var(--primary));
  background: hsl(var(--primary) / 0.1);
}

.dragging {
  opacity: 0.5;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}
```

### Indentation Levels (Maintain existing)

- Sections: 0px padding-left
- Steps: 28px padding-left
- Questions: 44px padding-left

Drag handles should appear within these indentation levels, not disrupt the hierarchy.

---

## Performance Considerations

1. **Memoization:** Use `useMemo` for sortable items arrays
2. **Virtualization:** Consider `react-window` if sections exceed 50+ items
3. **Debouncing:** Debounce API calls if rapid successive drags occur
4. **Bundle size:** dnd-kit adds ~50kb (gzipped ~15kb) - acceptable for desktop app

---

## Accessibility Requirements

### Keyboard Navigation

dnd-kit provides built-in keyboard support:
- **Tab:** Navigate to drag handle
- **Space/Enter:** Activate drag mode
- **Arrow keys:** Move item up/down
- **Escape:** Cancel drag

### Screen Reader Support

Add ARIA labels:

```typescript
<div
  {...attributes}
  {...listeners}
  aria-label={`Drag to reorder ${question.title}`}
  role="button"
  tabIndex={0}
>
  <GripVertical />
</div>
```

---

## Rollback Strategy

If implementation encounters blocking issues:

1. **Feature flag:** Wrap drag-and-drop in a feature flag to disable quickly
2. **Keep order_index:** Database changes are non-breaking, can keep for future
3. **Fallback UI:** Arrow buttons can be implemented as backup (2-3h effort)

---

## Success Metrics

Post-implementation validation:

- [ ] All three levels support drag-and-drop reordering
- [ ] Constraints prevent invalid drag operations
- [ ] Optimistic updates provide instant feedback
- [ ] No regression in existing collapse/expand functionality
- [ ] No performance degradation with 20+ sections
- [ ] Keyboard and screen reader accessible
- [ ] Visual indicators clear and intuitive
- [ ] Error handling gracefully rolls back changes

---

## Future Enhancements (Out of Scope)

- Undo/redo functionality for reorders
- Drag-and-drop across sections/steps (with confirmation dialog)
- Bulk reordering (multi-select and drag)
- Animated transitions beyond basic opacity
- Mobile touch support (currently desktop-only per requirements)

---

## References

- [dnd-kit Documentation](https://docs.dndkit.com/)
- [dnd-kit Sortable Examples](https://docs.dndkit.com/presets/sortable)
- [Existing reorderQuestionParts implementation](src/lib/api/questionnaires.ts:845-870)
- [Current Questions component](src/components/questionnaires/detail/questions/index.tsx)

---

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Setup & API | 4-5 hours | Dependencies installed, 3 reorder endpoints |
| Questions DnD | 5-6 hours | Question-level drag-and-drop working |
| Steps DnD | 4-6 hours | Step-level drag-and-drop working |
| Sections DnD | 3-4 hours | Section-level drag-and-drop working |
| Constraints | 3-4 hours | Cross-level dragging prevented |
| Visual Polish | 2-3 hours | Drag handles, drop zones, animations |
| React Query | 2-3 hours | Optimistic updates implemented |
| Edge Cases | 2-3 hours | All edge cases handled |
| Testing | 3-4 hours | Manual and automated tests passing |
| **Total** | **28-38 hours** | **Full drag-and-drop functionality** |

**Estimated: 3.5 - 5 days** (assuming 8-hour workdays)

---

*Document created: 2025-10-30*
*Project: Vantage Vite Questionnaire Editor*
