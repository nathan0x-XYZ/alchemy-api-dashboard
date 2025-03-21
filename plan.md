# Alchemy API Dashboard UI Component Plan

## 1. Base Components

### Button Component
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'icon';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}
```
Features:
- Primary Button with gradient background
- Secondary Button with light style
- Icon Button (circular) for toolbar
- Loading state support
- Disabled state styling

### Card Component
```typescript
interface CardProps {
  variant: 'basic' | 'stat' | 'status';
  title?: string;
  value?: string | number;
  label?: string;
  status?: 'healthy' | 'warning' | 'error';
}
```
Features:
- Basic card container
- Stat card with value and label
- Status card with status indicator
- Hover effect and smooth transitions

### Input Component
```typescript
interface InputProps {
  type: 'text' | 'json' | 'address';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}
```
Features:
- Text input
- JSON editor with formatting
- Ethereum address input with validation
- Error state handling

## 2. Composite Components

### StatusIndicator Component
```typescript
interface StatusIndicatorProps {
  status: 'healthy' | 'warning' | 'error';
  label: string;
  lastUpdated?: string;
}
```
Features:
- API status display
- Status dot with label
- Last updated timestamp

### MetricCard Component
```typescript
interface MetricCardProps {
  value: string | number;
  label: string;
  trend?: number;
  chart?: number[];
}
```
Features:
- API usage statistics display
- Value and label display
- Mini chart visualization
- Trend indicator

### ResponseViewer Component
```typescript
interface ResponseViewerProps {
  data: any;
  type: 'headers' | 'body';
  actions?: Array<'copy' | 'format'>;
}
```
Features:
- API response display
- JSON formatting
- Syntax highlighting
- Copy and format actions

## 3. Layout Components

### PageContainer Component
```typescript
interface PageContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}
```
Features:
- Mobile device frame container
- Content scrolling handling
- Consistent padding and spacing

### GradientHeader Component
```typescript
interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}
```
Features:
- Gradient background
- Title and subtitle display
- Action buttons area

## Design System

### Color System
```javascript
const colors = {
  primary: {
    light: '#818cf8',
    DEFAULT: '#6366f1',
    dark: '#4f46e5'
  },
  background: {
    light: '#f8fafc',
    dark: '#0f172a'
  }
  // Additional colors will be added as needed
}
```

### Spacing System
```javascript
const spacing = {
  xs: '0.5rem',    // 8px
  sm: '1rem',      // 16px
  md: '1.5rem',    // 24px
  lg: '2rem',      // 32px
  xl: '3rem'       // 48px
}
```

### Border Radius System
```javascript
const borderRadius = {
  sm: '0.5rem',    // 8px
  DEFAULT: '1rem',  // 16px
  lg: '1.5rem',    // 24px
  full: '9999px'
}
```

## Next.js Project Structure

```
my-app/
├── src/
│   ├── app/                    # App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx          # Home page
│   │   └── (routes)/         # Route groups
│   │       ├── dashboard/    
│   │       └── debug/        
│   ├── components/            # Shared components
│   │   ├── ui/               # Base UI components
│   │   │   ├── button/
│   │   │   ├── card/
│   │   │   └── input/
│   │   └── composite/        # Composite components
│   │       ├── status-indicator/
│   │       ├── metric-card/
│   │       └── response-viewer/
│   ├── layouts/              # Layout components
│   │   ├── app-layout/      # Main application layout
│   │   └── screen-layout/   # Mobile screen layout
│   ├── styles/              # Global styles
│   │   └── globals.css      
│   ├── lib/                 # Utilities and helpers
│   │   ├── constants/       # Constants and configurations
│   │   └── utils/          # Utility functions
│   └── types/               # TypeScript type definitions
├── public/                  # Static files
├── tailwind.config.js       # Tailwind configuration
└── package.json            # Project dependencies
```

### Key Folders and Their Purposes

1. **src/app/**
   - Uses Next.js 13+ App Router
   - Implements route groups for better organization
   - Contains page-specific components and layouts

2. **src/components/**
   - Separated into ui/ (base) and composite/ components
   - Each component has its own folder with:
     - Component file (index.tsx)
     - Styles (if needed)
     - Tests
     - Types

3. **src/layouts/**
   - AppLayout: Main application wrapper
   - ScreenLayout: Mobile-specific layout (375x812 PX)

4. **src/lib/**
   - Shared utilities and constants
   - API integration helpers
   - Theme management

5. **src/types/**
   - TypeScript interfaces and types
   - Shared type definitions

### Implementation Status

#### Layouts
- [x] AppLayout
- [x] ScreenLayout

#### Base Components
- [x] Button
- [x] Card
- [x] Input

#### Composite Components
- [x] StatusIndicator
- [x] APIKeyInput
- [x] EndpointCard
- [ ] MetricCard
- [ ] ResponseViewer

### Next Steps
1. Create project with proper structure
2. Implement layouts (AppLayout & ScreenLayout)
3. Implement base components
4. Add theme support
5. Implement composite components

## Implementation Priority
1. Base Components (Button, Card, Input)
2. Layout Components (PageContainer, GradientHeader)
3. Composite Components (StatusIndicator, MetricCard, ResponseViewer)

## Technical Specifications
- Mobile-first design (375x812 PX)
- Tailwind CSS for styling
- Dark mode support
- Smooth transitions and animations
- Responsive and accessible components
