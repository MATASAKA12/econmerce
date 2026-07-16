import { Star } from "lucide-react"

interface StarsProps {
  rating: number
}

export function Stars({ rating }: StarsProps) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={
            i <= Math.floor(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-gray-600"
          }
        />
      ))}
    </div>
  )
}