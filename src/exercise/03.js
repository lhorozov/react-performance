// React.memo for reducing unnecessary re-renders
// http://localhost:3000/isolated/exercise/03.js

import * as React from 'react'
import {useCombobox} from '../use-combobox'
import {getItems} from '../workerized-filter-cities'
import {useAsync, useForceRerender} from '../utils'

function Menu({
  items,
  getMenuProps,
  getItemProps,
  highlightedIndex,
  selectedItem,
}) {
  return (
    <ul {...getMenuProps()}>
      {items.map((item, index) => {
        return (
          <ListItem
            key={item.id}
            getItemProps={getItemProps}
            item={item}
            index={index}
            selectedItem={selectedItem}
            highlightedIndex={highlightedIndex}
          >
            {item.name}
          </ListItem>
        )
      })}
    </ul>
  )
}
// eslint-disable-next-line no-func-assign
Menu = React.memo(Menu)

function shouldSkipRender(prev, next) {
  if (prev.getItemProps !== next.getItemProps) {
    return false
  }
  if (prev.item !== next.item) {
    return false
  }
  if (prev.index !== next.index) {
    return false
  }
  if (prev?.selectedItem?.id !== next?.selectedItem?.id) {
    const wasSelected = prev?.selectedItem?.id === prev?.item?.id
    const shouldBeSelected = next?.selectedItem?.id === next?.item?.id
    return wasSelected === shouldBeSelected
  }

  if (prev.highlightedIndex !== next.highlightedIndex) {
    const wasItHighlighted = prev.highlightedIndex === prev.index
    const shouldBeHighlighted = next.highlightedIndex === next.index

    return wasItHighlighted === shouldBeHighlighted
  }

  return true
}

function ListItem({
  getItemProps,
  item,
  index,
  selectedItem,
  highlightedIndex,
  ...props
}) {
  const isSelected = selectedItem?.id === item.id
  const isHighlighted = highlightedIndex === index
  return (
    <li
      {...getItemProps({
        index,
        item,
        style: {
          fontWeight: isSelected ? 'bold' : 'normal',
          backgroundColor: isHighlighted ? 'lightgray' : 'inherit',
        },
        ...props,
      })}
    />
  )
}
// eslint-disable-next-line no-func-assign
ListItem = React.memo(ListItem, shouldSkipRender)

function App() {
  const forceRerender = useForceRerender()
  const [inputValue, setInputValue] = React.useState('')

  const {data: allItems, run} = useAsync({data: [], status: 'pending'})
  React.useEffect(() => {
    run(getItems(inputValue))
  }, [inputValue, run])
  const items = allItems.slice(0, 100)

  const {
    selectedItem,
    highlightedIndex,
    getComboboxProps,
    getInputProps,
    getItemProps,
    getLabelProps,
    getMenuProps,
    selectItem,
  } = useCombobox({
    items,
    inputValue,
    onInputValueChange: ({inputValue: newValue}) => setInputValue(newValue),
    onSelectedItemChange: ({selectedItem}) =>
      alert(
        selectedItem
          ? `You selected ${selectedItem.name}`
          : 'Selection Cleared',
      ),
    itemToString: item => (item ? item.name : ''),
  })

  return (
    <div className="city-app">
      <button onClick={forceRerender}>force rerender</button>
      <div>
        <label {...getLabelProps()}>Find a city</label>
        <div {...getComboboxProps()}>
          <input {...getInputProps({type: 'text'})} />
          <button onClick={() => selectItem(null)} aria-label="toggle menu">
            &#10005;
          </button>
        </div>
        <Menu
          items={items}
          getMenuProps={getMenuProps}
          getItemProps={getItemProps}
          highlightedIndex={highlightedIndex}
          selectedItem={selectedItem}
        />
      </div>
    </div>
  )
}

export default App
