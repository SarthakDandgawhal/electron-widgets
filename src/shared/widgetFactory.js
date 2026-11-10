"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWidgetComponent = createWidgetComponent;
exports.getWidgetDefinition = getWidgetDefinition;
const react_1 = require("react");
const StickyNoteWidget = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require('../renderer/widgets/StickyNoteWidget'))).then(m => ({ default: m.StickyNoteWidget })));
const ClockWidget = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require('../renderer/widgets/ClockWidget'))).then(m => ({ default: m.ClockWidget })));
const WeatherWidget = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require('../renderer/widgets/WeatherWidget'))).then(m => ({ default: m.WeatherWidget })));
const SystemMonitorWidget = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require('../renderer/widgets/SystemMonitorWidget'))).then(m => ({ default: m.SystemMonitorWidget })));
const TodoListWidget = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require('../renderer/widgets/TodoListWidget'))).then(m => ({ default: m.TodoListWidget })));
const CalendarWidget = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require('../renderer/widgets/CalendarWidget'))).then(m => ({ default: m.CalendarWidget })));
const CalculatorWidget = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require('../renderer/widgets/CalculatorWidget'))).then(m => ({ default: m.CalculatorWidget })));
const ColorPickerWidget = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require('../renderer/widgets/ColorPickerWidget'))).then(m => ({ default: m.ColorPickerWidget })));
const WIDGET_COMPONENTS = {
    'sticky-note': StickyNoteWidget,
    'clock': ClockWidget,
    'weather': WeatherWidget,
    'system-monitor': SystemMonitorWidget,
    'todo-list': TodoListWidget,
    'calendar': CalendarWidget,
    'calculator': CalculatorWidget,
    'color-picker': ColorPickerWidget,
};
function createWidgetComponent(type) {
    return WIDGET_COMPONENTS[type] || StickyNoteWidget;
}
function getWidgetDefinition(type) {
    return WIDGET_DEFINITIONS.find(w => w.type === type) || WIDGET_DEFINITIONS[0];
}
//# sourceMappingURL=widgetFactory.js.map