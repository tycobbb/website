import { css } from "@emotion/core"

// -- impls --
// -- impls/sizes
export const kFontSize1 = "46px"
export const kFontSize2 = "36px"
export const kFontSize3 = "26px"
export const kFontSize4 = "18px"
export const kFontSize5 = "16px"
export const kFontSize6 = "14px"

// -- impls/fonts
export const kFontRegular = css`
  font-family: system-ui, sans-serif;
  font-weight: 400;
`

export const kFontRegularItalic = css`
  font-family: system-ui, sans-serif;
  font-weight: 400;
  font-style: italic;
`

export const kFontMedium = css`
  font-family: system-ui, sans-serif;
  font-weight: 500;
`

export const kFontMediumSerif = css`
  font-family: Eczar, Georgia, serif;
  font-weight: 500;
`

// -- impls/text
export const kTextTitle = css`
  ${kFontMediumSerif};
  font-size: ${kFontSize1};
  line-height: 1;
`

export const kTextArticle = css`
  ${kFontMediumSerif};
  font-size: ${kFontSize2};
  line-height: 1;
`

export const kTextSection = css`
  ${kFontMediumSerif};
  font-size: ${kFontSize3};
  line-height: 1;
`

export const kTextNav = css`
  ${kFontRegular};
  font-size: ${kFontSize4};
  line-height: 1;
`

export const kTextBody = css`
  ${kFontRegular};
  font-size: ${kFontSize5};
  line-height: 1.5;
`

export const kTextHint = css`
  ${kFontRegular};
  font-size: ${kFontSize6};
  line-height: 1;
`
