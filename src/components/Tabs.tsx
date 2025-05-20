import React, { ReactElement, useState } from 'react'

interface TabItem {
  key: string
  label: string
  children: ReactElement
}

interface TabsProps {
  items: TabItem[]
  defaultActiveKey?: string
  onChange?: (key: string) => void
  className?: string
}

function Tabs({ items, defaultActiveKey, onChange, className = '' }: TabsProps): ReactElement {
  const [activeKey, setActiveKey] = useState(defaultActiveKey || items[0]?.key)

  const handleTabClick = (key: string) => {
    setActiveKey(key)
    onChange?.(key)
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Headers */}
      <div className="flex space-x-1 border-b border-gray-200">
        {items.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleTabClick(key)}
            className={`
              px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
              ${activeKey === key ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {items.map(({ key, children }) => (
          <div key={key} className={`transition-opacity duration-200 ${activeKey === key ? 'block opacity-100' : 'hidden opacity-0'}`}>
            {children}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Tabs
