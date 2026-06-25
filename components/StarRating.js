'use client'

import { useState } from 'react'

const EMOJIS = ['😡', '😟', '😐', '😊', '🤩']

export default function StarRating({ onRate, labels }) {
  const [hovered, setHovered] = useState(null)
  const [selected, setSelected] = useState(null)

  function handleClick(rating) {
    setSelected(rating)
    setTimeout(() => onRate(rating), 200)
  }

  const active = hovered ?? selected

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-3 sm:gap-4">
        {EMOJIS.map((emoji, i) => {
          const rating = i + 1
          const isActive = active !== null && rating <= active
          return (
            <button
              key={rating}
              onMouseEnter={() => setHovered(rating)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleClick(rating)}
              className={`text-4xl sm:text-5xl transition-all duration-150 select-none
                ${isActive ? 'scale-110 drop-shadow-lg' : 'opacity-50 grayscale'}
                hover:scale-125 hover:opacity-100 hover:grayscale-0 active:scale-95`}
              aria-label={`Rate ${rating}`}
            >
              {emoji}
            </button>
          )
        })}
      </div>
      <p className={`text-sm font-medium text-gray-500 h-5 transition-opacity duration-150
        ${active !== null ? 'opacity-100' : 'opacity-0'}`}>
        {active !== null ? labels[active - 1] : ''}
      </p>
    </div>
  )
}
