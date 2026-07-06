import React, { useContext } from 'react';
import classes from './index.module.css';
import cx from 'classnames';
import {
  COLORS,
  FILL_TOOL_TYPES,
  SIZE_TOOLS_TYPES,
  STROKE_TOOL_TYPES,
  TOOL_ITEMS,
} from '../../constants';
import toolboxContext from '../../store/toolbox-context';
import boardContext from '../../store/board-context';

const ToolBox = () => {
  const { activeToolItem } = useContext(boardContext);
  const { toolBoxState, changeStroke, changeFill, changeSize } = useContext(toolboxContext);

  if (activeToolItem === TOOL_ITEMS.ERASER) return null;

  const strokeColor = toolBoxState[activeToolItem]?.stroke;
  const fillColor = toolBoxState[activeToolItem]?.fill;
  const size = toolBoxState[activeToolItem]?.size;

  return (
    <div className={classes.container}>
      {STROKE_TOOL_TYPES.includes(activeToolItem) && (
        <div className={classes.selectOptionContainer}>
          <div className={classes.toolBoxLabel}>Stroke</div>
          <div className={classes.colorsContainer}>
            <div>
              <input
                className={classes.colorPicker}
                type="color"
                value={strokeColor}
                onChange={(e) => changeStroke(activeToolItem, e.target.value)}
                aria-label="Stroke color picker"
              />
            </div>
            {Object.keys(COLORS).map((k) => (
              <div
                key={k}
                className={cx(classes.colorBox, {
                  [classes.activeColorBox]: strokeColor === COLORS[k],
                })}
                style={{ backgroundColor: COLORS[k] }}
                onClick={() => changeStroke(activeToolItem, COLORS[k])}
              />
            ))}
          </div>
        </div>
      )}

      {FILL_TOOL_TYPES.includes(activeToolItem) && (
        <div className={classes.selectOptionContainer}>
          <div className={classes.toolBoxLabel}>Fill Color</div>
          <div className={classes.colorsContainer}>
            {fillColor === null ? (
              <div
                className={cx(classes.colorPicker, classes.noFillColorBox)}
                onClick={() => changeFill(activeToolItem, COLORS.BLACK)}
              />
            ) : (
              <div>
                <input
                  className={classes.colorPicker}
                  type="color"
                  value={fillColor}
                  onChange={(e) => changeFill(activeToolItem, e.target.value)}
                  aria-label="Fill color picker"
                />
              </div>
            )}
            <div
              className={cx(classes.colorBox, classes.noFillColorBox, {
                [classes.activeColorBox]: fillColor === null,
              })}
              onClick={() => changeFill(activeToolItem, null)}
            />
            {Object.keys(COLORS).map((k) => (
              <div
                key={k}
                className={cx(classes.colorBox, {
                  [classes.activeColorBox]: fillColor === COLORS[k],
                })}
                style={{ backgroundColor: COLORS[k] }}
                onClick={() => changeFill(activeToolItem, COLORS[k])}
              />
            ))}
          </div>
        </div>
      )}

      {SIZE_TOOLS_TYPES.includes(activeToolItem) && (
        <div className={classes.selectOptionContainer}>
          <div className={classes.toolBoxLabel}>
            {activeToolItem === TOOL_ITEMS.TEXT ? 'Font Size' : 'Brush Size'}
          </div>
          <input
            type="range"
            min={activeToolItem === TOOL_ITEMS.TEXT ? 12 : 1}
            max={activeToolItem === TOOL_ITEMS.TEXT ? 64 : 10}
            step={1}
            value={size}
            onChange={(event) => changeSize(activeToolItem, Number(event.target.value))} 
            aria-label={activeToolItem === TOOL_ITEMS.TEXT ? 'Font size' : 'Brush size'}
          />
        </div>
      )}
    </div>
  );
};

export default ToolBox;