import { Chip, makeStyles } from '@material-ui/core'
import React from 'react'
import classnames from 'classnames'

const arrowLength = '1em'
const arrowThickness = '3px'

const useStyles = makeStyles(() => ({
  cls: {
    // backgroundColor: 'rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
  },
  bases: {
    display: 'flex',
    flexDirection: 'column',
    height: '50%',
  },
  clsName: {
    margin: '4px',
  },
  frontLiner: {
    borderBottom: `${arrowThickness} solid black`,
    width: arrowLength,
    height: '50%«',
  },
  backLiner: {
    display: 'flex',
    flexDirection: 'column',
    width: arrowLength,
    alignSelf: 'normal',
  },
  backLinerTop: {
    flex: 1,
    borderLeft: `${arrowThickness} solid black`,
    borderBottom: `${arrowThickness} solid black`,
  },
  backLinerBottom: {
    flex: 1,
    borderLeft: `${arrowThickness} solid black`,
  },
  noLeftLiner: {
    borderLeft: 'none',
  },
}))

export default function ClassBases({
  cls: { name, bases },
  first,
  last,
  root,
}) {
  const classes = useStyles()
  return (
    <div className={classes.cls}>
      {!root && (
        <div className={classes.backLiner}>
          <div
            className={classnames(classes.backLinerTop, {
              [classes.noLeftLiner]: first,
            })}
          />
          <div
            className={classnames(classes.backLinerBottom, {
              [classes.noLeftLiner]: last,
            })}
          />
        </div>
      )}
      <div className={classes.clsName}>
        <Chip
          label={name}
          color={['object', 'type'].includes(name) ? void 0 : 'secondary'}
        />
      </div>
      {!!bases.length && <div className={classes.frontLiner} />}
      <div className={classes.bases}>
        {bases.map((base, i) => (
          <ClassBases
            key={base.name}
            cls={base}
            classes={classes}
            first={i === 0}
            last={i === bases.length - 1}
          />
        ))}
      </div>
    </div>
  )
}
