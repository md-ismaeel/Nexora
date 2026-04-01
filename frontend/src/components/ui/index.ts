// ── HeroUI v3 barrel export ───────────────────────────────────────────────────
// In v3 all compound components live under a single named export.
// Sub-components are accessed via dot notation: Avatar.Image, Card.Content, etc.
// Named exports like CardHeader, ListboxItem, DropdownMenu no longer exist.

// ── Buttons & Toggles ─────────────────────────────────────────────────────────
export { Button, ButtonGroup } from "@heroui/react";
export { CloseButton } from "@heroui/react";
export { ToggleButton, ToggleButtonGroup } from "@heroui/react";

// ── Form primitives (React Aria–based) ───────────────────────────────────────
export { Form } from "@heroui/react";
export { TextField } from "@heroui/react";
export { Label } from "@heroui/react";
export { Input } from "@heroui/react";
export { TextArea } from "@heroui/react";
export { FieldError } from "@heroui/react";
export { Description } from "@heroui/react";
export { InputGroup } from "@heroui/react";
export { InputOTP } from "@heroui/react";

// ── Selectors & pickers ───────────────────────────────────────────────────────
export { Checkbox, CheckboxGroup } from "@heroui/react";
export { Switch } from "@heroui/react";
export { RadioGroup, Radio } from "@heroui/react";
// v3 Select uses <Select><Label /><ListBox>...</ListBox></Select>
export { Select } from "@heroui/react";
export { Autocomplete } from "@heroui/react";
export { Slider } from "@heroui/react";

// ── Data display ──────────────────────────────────────────────────────────────
// v3 Avatar  →  <Avatar><Avatar.Image /><Avatar.Fallback /></Avatar>
export { Avatar } from "@heroui/react";
export { Badge } from "@heroui/react";
export { Chip } from "@heroui/react";
// v3 Card    →  <Card><Card.Content /><Card.Footer /></Card>
export { Card } from "@heroui/react";
// v3 ListBox →  <ListBox><ListBox.Item /></ListBox>
export { ListBox } from "@heroui/react";
export { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
export { Surface } from "@heroui/react";

// ── Navigation ────────────────────────────────────────────────────────────────
// v3 Tabs    →  <Tabs><Tab key="x" title="X">content</Tab></Tabs>
export { Tabs, Tab } from "@heroui/react";
// v3 Accordion → <Accordion><Accordion.Item /></Accordion>
export { Accordion } from "@heroui/react";
export { Link } from "@heroui/react";
export { Breadcrumbs } from "@heroui/react";

// ── Overlays ──────────────────────────────────────────────────────────────────
// v3 Modal   →  <Modal isOpen onClose><Modal.Backdrop /><Modal.Container><Modal.Dialog>…
export { Modal } from "@heroui/react";
// v3 Drawer  →  <Drawer isOpen onClose><Drawer.Backdrop /><Drawer.Content>…
export { Drawer } from "@heroui/react";
// v3 Dropdown → <Dropdown><Dropdown.Trigger /><Dropdown.Content><Dropdown.Item /></Dropdown.Content></Dropdown>
export { Dropdown } from "@heroui/react";
// v3 Popover → <Popover><Popover.Trigger /><Popover.Content /></Popover>
export { Popover } from "@heroui/react";
// v3 Tooltip → <Tooltip><Tooltip.Trigger /><Tooltip.Content /></Tooltip>
export { Tooltip } from "@heroui/react";
export { Alert } from "@heroui/react";
export { AlertDialog } from "@heroui/react";
// v3 Toast   →  managed via <Toast.Provider /> at app root
export { Toast } from "@heroui/react";

// ── Feedback ─────────────────────────────────────────────────────────────────
export { Skeleton } from "@heroui/react";
export { Spinner } from "@heroui/react";
export { ProgressBar, ProgressCircle } from "@heroui/react";
export { Meter } from "@heroui/react";

// ── Layout helpers ────────────────────────────────────────────────────────────
export { ScrollShadow } from "@heroui/react";
export { Kbd } from "@heroui/react";
export { Toolbar } from "@heroui/react";