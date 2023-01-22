import React from "react"
import { RE_DIGIT } from "~/constants"

interface Props {
  value: string
  valueLen: number
  onChange: (value: string) => void
}

export default function OtpInput({ value, valueLen, onChange }: Props) {
  const valueItems = React.useMemo(() => {
    const valueArray = value.split("")
    return new Array(valueLen).fill(1).map((_, i) => {
      const item = valueArray[i]
      return RE_DIGIT.test(item) ? item : ""
    })
  }, [value, valueLen])

  function focusNextInput(target: HTMLElement) {
    const nextSibling = target.nextElementSibling as HTMLInputElement | null
    if (nextSibling) nextSibling.focus()
  }

  function focusPrevInput(target: HTMLElement) {
    const prevSibling = target.previousElementSibling as HTMLInputElement | null
    if (prevSibling) prevSibling.focus()
  }

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) {
    const target = e.target
    let targetValue = target.value
    const isDigit = RE_DIGIT.test(targetValue)
    if (!isDigit && targetValue !== "") return

    targetValue = isDigit ? targetValue : " "
    const targetValueLength = targetValue.length

    if (targetValueLength === 1) {
      const newValue =
        value.substring(0, index) + targetValue + value.substring(index + 1)

      onChange(newValue)

      if (!isDigit) {
        return
      }

      focusNextInput(target)
    } else if (targetValueLength === valueLen) {
      onChange(targetValue)

      target.blur()
    }

    const nextElementSibling =
      target.nextElementSibling as HTMLInputElement | null

    if (!nextElementSibling && targetValue && targetValue !== " ") {
      target.blur()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const { key } = e
    const target = e.target as HTMLInputElement

    if (key === "ArrowRight" || key === "ArrowDown") {
      e.preventDefault()
      return focusNextInput(target)
    }

    if (key === "ArrowLeft" || key === "ArrowUp") {
      e.preventDefault()
      return focusPrevInput(target)
    }

    const targetValue = target.value
    // keep the selection range positions
    // if the same digit was typed
    target.setSelectionRange(0, targetValue.length)

    if (key !== "Backspace" || targetValue !== "") return

    focusPrevInput(target)
  }

  function onInputFocus(e: React.FocusEvent<HTMLInputElement>) {
    const { target } = e
    // keep focusing back until previous input
    // element has value
    const prevInputEl = target.previousElementSibling as HTMLInputElement | null

    if (prevInputEl && prevInputEl.value === "") {
      return prevInputEl.focus()
    }
    // target.setSelectionRange(0, target.value.length)
  }

  return (
    <div className="flex w-full max-w-[360px] gap-x-3">
      {valueItems.map((v, i) => (
        <input
          key={i}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{1}"
          className={`w-full h-14 text-center font-semibold text-2xl border border-borderGray leading-[1px] rounded-md outline-none focus:border-[3px] focus:border-blue-600 ${
            v ? "border-[2px] border-borderDarkGray" : ""
          }`}
          maxLength={valueLen}
          value={v}
          onChange={(e) => handleInputChange(e, i)}
          onKeyDown={handleKeyDown}
          onFocus={onInputFocus}
        />
      ))}
    </div>
  )
}
