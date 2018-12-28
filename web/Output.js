import React, { PureComponent } from 'react'
import { pure } from 'recompose'
import classNames from 'classnames'
import ansi2html from './ansi2html'
import isSafari from './is-safari'
import { FixedSizeList } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

import style from './styles/Output.scss'

const errorOutput = (err) =>
  err.stack ? (isSafari ? err.toString() : err.stack)
            : err

const hasAnsiColors = (outputType) => ['pretty', 'table'].includes(outputType)

const AnsiPre = pure(({ str, style }) => (
  <pre
    style={style}
    dangerouslySetInnerHTML={ansi2html(str, {
      escapeXML: true,
      fg: '#afafaf',
      bg: '#0a0a0a'
    })}
  />
))

class OutputRow extends PureComponent {
  render() {
    const { data, index, style: rwStyle, outputType } = this.props
    const content = data[index]
    return hasAnsiColors(outputType) ? (
      <AnsiPre style={rwStyle} str={content} />
    ) : (
      <pre style={rwStyle}>{content}</pre>
    )
  }
}

class Output extends PureComponent {
  constructor(props) {
    super(props)
  }

  render() {
    const { outputType, output, isError, nearEnd } = this.props
    const lines = (isError ? errorOutput(output) : output).split('\n')

    return (
      <div className={classNames(style.output, { [style.error]: isError })}>
        <AutoSizer disableWidth={true}>
          {({ height }) => (
            <FixedSizeList
              className={style.outputList}
              height={height}
              itemData={lines}
              itemCount={lines.length}
              itemSize={24}
              onItemsRendered={({ visibleStartIndex, visibleStopIndex }) => {
                const visibleLines = visibleStopIndex - visibleStartIndex
                const isNearEnd =
                  lines.length - visibleStopIndex < visibleLines * 3
                if (isNearEnd) nearEnd()
              }}
            >
              {(props) => <OutputRow {...props} outputType={outputType} />}
            </FixedSizeList>
          )}
        </AutoSizer>
      </div>
    )
  }
}

export default Output
