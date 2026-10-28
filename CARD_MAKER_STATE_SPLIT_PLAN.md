# Plan: Split Card Maker State by Responsibilities

## Current State Analysis

The current implementation has a single Zustand store (src/pages/card-maker/state.ts) managing the entire YugiohCardDraft object in one store. All components import useCardStore and subscribe to card (or destructure). This causes unnecessary re-renders and makes the state harder to reason about.

### Current structure
- Store: useCardStore with card: Partial<YugiohCardDraft>, setCard, esetCard

### Field categorization by responsibility

**Card Data (Core identity/type/mechanics)**
- 
ame, cardType, ttribute
- monsterType, subType, spellType, 	rapType
- isTuner, linkRating, linkMarkers, linkMarkersOnDescription
- scale
- stats { level, atk, def }
- description, pendulumDescription

**Display/Presentation**
- showName, showNameBox, showDescription, showStatsBox
- 	emplate, iconProfile
- descriptionTextColor, descriptionTextSize
- descriptionImageOpacity, descriptionStatsBoxColor

**Images**
- img, objectFit, imgRotationDeg
- overframe, ullArt, overframeImg, overframeObjectFit, overframeImgRotationDeg

**Export**
- exportFormat

## Proposed Split

Create separate stores by responsibility:

### Store 1: useCardDataStore (src/pages/card-maker/stores/card-data-store.ts)
Manages core card identity, type, mechanics, and text content.

### Store 2: useCardDisplayStore (src/pages/card-maker/stores/card-display-store.ts)
Manages UI/display preferences.

### Store 3: useCardImageStore (src/pages/card-maker/stores/card-image-store.ts)
Manages images and image rendering options.

### Store 4: useCardExportStore (src/pages/card-maker/stores/card-export-store.ts)
Manages export configuration.

Also create a composed hook for backward compatibility and easier migration.

## Migration Plan

### Phase 1: Create new stores
Create stores directory with the four stores and barrel exports.

### Phase 2: Update components
Update each component to use appropriate split stores. Components that need everything can compose or use multiple stores.

### Phase 3: Update imports
Replace imports from old state.ts with new stores.

### Phase 4: Cleanup
Deprecate/remove old monolithic store once migration complete.

## Component Update Mapping
- index.tsx: card-data + card-images + full reset coordination
- card-preview.tsx: all stores (needs full picture for rendering)
- card-maker-form.tsx: card-data, card-display, card-images, card-export
- card-searcher-form.tsx: card-data, card-images
- deck-importer-form.tsx: card-data, card-images
- card-maker-form/* subcomponents: specific stores as needed

## Implementation Notes
- Use Zustand v5 patterns
- Keep types from @/lib/types
- Provide both granular access and convenience composition
- Update all usages to minimize re-renders
