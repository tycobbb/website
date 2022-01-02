import React from "react"
import { ClassNames } from "@emotion/core"
import { Link } from "gatsby"
import * as S from "@/Ui/Styles"

// -- types --
interface IProps {
  to: string
  children: string
}

// -- impls --
export function NavLink(props: IProps) {
  return (
    <ClassNames>
      {({ css }) => (
        <Link
          {...props}
          partiallyActive={props.to !== "/"}
          activeClassName={css`
            color: ${S.kColorPrimary};
            pointer-events: none;
            text-decoration: none;
          `}
        />
      )}
    </ClassNames>
  )
}
