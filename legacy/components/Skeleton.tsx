import * as React from "react"
import { cn } from "../lib/utils"
import styles from "../styles/Skeleton.module.css"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(styles.skeleton, className)}
      {...props}
    />
  )
}
