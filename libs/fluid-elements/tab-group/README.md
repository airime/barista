# fluid-tab

A basic representation of the tab component

## Properties

| Property   | Attribute  | Type      | Default   | Description                             |
| ---------- | ---------- | --------- | --------- | --------------------------------------- |
| `tabid`    | `tabid`    | `boolean` | unique id | Sets an unique ID on the tab.           |
| `active`   | `active`   | `boolean` | false     | Defines if the tab is active or not.    |
| `tabindex` | `tabindex` | `number`  |           | Defines if the tab is focusable or not. |
| `disabled` | `disabled` | `boolean` | false     | Defines if the tab is disabled or not.  |

## Methods

| Method   | Type       | Description                                                                                          |
| -------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| `toggle` | `(): void` | Toggles the state of the checkbox.<br />When called programmatically will not fire a `change` event. |

## Events

| Event          | Description                                                                               |
| -------------- | ----------------------------------------------------------------------------------------- |
| `tabActivated` | Event that is being fired when the tab active state changes due<br />to user interaction. |
| `disabled`     | Event that is being fired when the disabled<br />state of the checkbox changes.           |

## Slots

| Name | Description                                                  |
| ---- | ------------------------------------------------------------ |
|      | Default slot lets the user provide a li element for the tab. |

# fluid-tab-group

A basic representation of the tab grouping component

## Properties

| Property      | Attribute     | Type     | Default                  | Description                       |
| ------------- | ------------- | -------- | ------------------------ | --------------------------------- |
| `activetabid` | `activetabid` | `string` | first tab of a tab group | Defines the currently active tab. |

## Events

| Event              | Description                                                                         |
| ------------------ | ----------------------------------------------------------------------------------- |
| `activeTabChanged` | Event that is being fired when the active tab changes due<br />to user interaction. |

## Slots

| Name | Description                                                                        |
| ---- | ---------------------------------------------------------------------------------- |
|      | Default slot lets the user provide a ul element containing tabs for the tab-group. |
