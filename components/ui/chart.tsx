"use client"

interface BarChartProps {
  data: Array<{
    name: string
    value: number
    color?: string
  }>
  height?: number
}

export function BarChart({ data, height = 300 }: BarChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value))

  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-end justify-between h-full gap-2 p-4">
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? (item.value / maxValue) * (height - 80) : 0
          const color = item.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)`

          return (
            <div key={item.name} className="flex flex-col items-center flex-1 min-w-0">
              <div className="text-sm font-medium mb-2">{item.value}</div>
              <div
                className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                style={{
                  height: `${barHeight}px`,
                  backgroundColor: color,
                  minHeight: item.value > 0 ? "4px" : "0px",
                }}
              />
              <div className="text-xs text-gray-600 mt-2 text-center break-words">{item.name}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface LineChartProps {
  data: Array<{
    name: string
    value: number
  }>
  height?: number
}

export function LineChart({ data, height = 200 }: LineChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value))
  const minValue = Math.min(...data.map((item) => item.value))
  const range = maxValue - minValue || 1

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((item.value - minValue) / range) * 80
    return `${x},${y}`
  })

  return (
    <div className="w-full" style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" className="overflow-visible">
        <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points={points.join(" ")} />
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 100
          const y = 100 - ((item.value - minValue) / range) * 80
          return (
            <g key={index}>
              <circle cx={x} cy={y} r="3" fill="#3b82f6" />
              <text x={x} y={y - 8} textAnchor="middle" className="text-xs fill-gray-600">
                {item.value}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="flex justify-between mt-2">
        {data.map((item, index) => (
          <div key={index} className="text-xs text-gray-600 text-center">
            {item.name}
          </div>
        ))}
      </div>
    </div>
  )
}

interface PieChartProps {
  data: Array<{
    name: string
    value: number
    color?: string
  }>
  size?: number
}

export function PieChart({ data, size = 200 }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let currentAngle = 0

  const radius = size / 2 - 10
  const centerX = size / 2
  const centerY = size / 2

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size}>
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100
          const angle = (item.value / total) * 360
          const startAngle = currentAngle
          const endAngle = currentAngle + angle

          const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180)
          const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180)
          const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180)
          const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180)

          const largeArcFlag = angle > 180 ? 1 : 0
          const color = item.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)`

          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${startX} ${startY}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            "Z",
          ].join(" ")

          currentAngle += angle

          return (
            <path
              key={index}
              d={pathData}
              fill={color}
              stroke="white"
              strokeWidth="2"
              className="hover:opacity-80 transition-opacity"
            />
          )
        })}
      </svg>

      <div className="space-y-2">
        {data.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1)
          const color = item.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)`

          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
              <span className="flex-1">{item.name}</span>
              <span className="font-medium">
                {item.value} ({percentage}%)
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
