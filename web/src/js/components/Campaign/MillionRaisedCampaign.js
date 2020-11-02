import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import grey from '@material-ui/core/colors/grey'
import { setCampaignDismissTime } from 'js/utils/local-user-data-mgr'
import Typography from '@material-ui/core/Typography'
import Link from 'js/components/General/Link'
import {
  millionRaisedURL,
  facebookPageURL,
  instagramPageURL,
  twitterPageURL,
} from 'js/navigation/navigation'
import useMoneyRaised from 'js/utils/hooks/useMoneyRaised'

const styles = theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    pointerEvents: 'none',
  },
  paper: {
    position: 'relative',
    pointerEvents: 'all',
    minWidth: 400,
    width: '100%',
    margin: 0,
    padding: 0,
    background: '#FFF',
    border: 'none',
  },
  borderTop: {
    width: '100%',
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    backgroundColor: theme.palette.secondary.main,
  },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 2,
  },
  campaignContent: {
    padding: 12,
  },
  campaignAddendum: {
    display: 'flex',
    flexDirection: 'column',
    background: grey[100],
    padding: 12,
  },
  mainTextContainer: {},
  title: {
    textAlign: 'center',
  },
  moneyRaised: {
    color: theme.palette.primary.main,
  },
  description: {
    margin: 14,
    textAlign: 'left',
  },
  link: {
    color: theme.palette.primary.main,
  },
  hashtag: {
    margin: '0px auto 10px auto',
    background: grey[500],
    padding: '2px 14px',
    borderRadius: 3,
    display: 'inline-block',
  },
  hashtagText: {
    color: 'white',
  },
  addendumButtonContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
})

const DAY_2020_11_02 = '2020-11-02' // Monday
const DAY_2020_11_03 = '2020-11-03'
const DAY_2020_11_04 = '2020-11-04' // Wednesday
const DAY_2020_11_05 = '2020-11-05'
const DAY_2020_11_06 = '2020-11-06' // Friday
const DAY_2020_11_07 = '2020-11-07'
const DAY_2020_11_08 = '2020-11-08'
const DAY_2020_11_09 = '2020-11-09' // Monday
const DAY_2020_11_10 = '2020-11-10'
const DAY_2020_11_11 = '2020-11-11' // Wednesday
const DAY_2020_11_12 = '2020-11-12'
const DAY_2020_11_13 = '2020-11-13' // Friday
const DAY_2020_11_14 = '2020-11-14'
const DAY_2020_11_15 = '2020-11-15'
const DAY_2020_11_16 = '2020-11-16' // Monday
const DAY_2020_11_17 = '2020-11-17'
const DAY_2020_11_18 = '2020-11-18'

const getCampaignContent = ({
  app,
  classes,
  currentDateString,
  moneyRaisedUSDString,
}) => {
  const defaultTitle = (
    <Typography variant="h6">A tab you'll want to keep open:</Typography>
  )
  const moneyRaisedDisplay = (
    <Typography variant="h2" align={'center'} gutterBottom>
      <span className={classes.moneyRaised}>{moneyRaisedUSDString}</span>
    </Typography>
  )
  const defaultMainContent = (
    <div>
      {moneyRaisedDisplay}
      <Typography variant="body2" gutterBottom>
        We're about to reach $1M raised for charity! It's amazing what a
        dedicated community and a few (million) browser tabs can do.{' '}
        <Link
          to={millionRaisedURL}
          target="_blank"
          rel="noopener noreferrer"
          className={classes.link}
        >
          See what we've accomplished together
        </Link>{' '}
        and join us as we celebrate this milestone!
      </Typography>
    </div>
  )
  const defaultAddendumContent = (
    <>
      <div className={classes.hashtag}>
        <Typography variant="subtitle2" className={classes.hashtagText}>
          #TabForAMillion
        </Typography>
      </div>
      <Typography variant="body2" gutterBottom>
        <span style={{ fontWeight: 'bold' }}>What you can do today:</span> check
        out{' '}
        <Link
          to={millionRaisedURL}
          target="_blank"
          rel="noopener noreferrer"
          className={classes.link}
        >
          the real-world good your tabs have turned into here
        </Link>
        ! Share the achievement you're proudest of.
      </Typography>
    </>
  )

  const addendumContentMonday = (
    <>
      <div className={classes.hashtag}>
        <Typography variant="subtitle2" className={classes.hashtagText}>
          #MillionaireMonday
        </Typography>
      </div>
      <Typography variant="body2" gutterBottom>
        <span style={{ fontWeight: 'bold' }}>What you can do today: </span>@ a
        multi-millionaire to have them match our $1M! For us, it was as easy as
        opening tabs. For them, it's as easy as writing a check.
      </Typography>
    </>
  )
  const addendumContentTuesday = (
    <>
      <div className={classes.hashtag}>
        <Typography variant="subtitle2" className={classes.hashtagText}>
          #TabberTuesday
        </Typography>
      </div>
      <Typography variant="body2" gutterBottom>
        <span style={{ fontWeight: 'bold' }}>What you can do today: </span>
        Celebrating this milestone would not be possible without all of you. We
        would love to hear from you on social media why you tab! DM us
        @tabforacause or post to your feed with #TabForAMillion to be featured
        on #TabberTuesday.
      </Typography>
    </>
  )
  const addendumContentWednesday = (
    <>
      <div className={classes.hashtag}>
        <Typography variant="subtitle2" className={classes.hashtagText}>
          #WelcomeWednesday
        </Typography>
      </div>
      <Typography variant="body2" gutterBottom>
        <span style={{ fontWeight: 'bold' }}>What you can do today: </span>text,
        email, tiktok, carrier-pigeon, or talk to 2 friends or family members
        about Tab for a Cause! If every person who sees this gets 2 friends to
        turn their tabs into a force for good, we'll be celebrating $2M raised
        in less than a year!
      </Typography>
    </>
  )
  const addendumContentThursday = (
    <>
      <div className={classes.hashtag}>
        <Typography variant="subtitle2" className={classes.hashtagText}>
          #ThankfulThursday
        </Typography>
      </div>
      <Typography variant="body2" gutterBottom>
        <span style={{ fontWeight: 'bold' }}>What you can do today: </span>
        join us in letting the world know how impactful a tab can be by liking,
        reposting, and/or sharing our #ThankfulThursday posts on{' '}
        <Link
          to={instagramPageURL}
          target="_blank"
          rel="noopener noreferrer"
          className={classes.link}
        >
          Instagram
        </Link>
        ,{' '}
        <Link
          to={facebookPageURL}
          target="_blank"
          rel="noopener noreferrer"
          className={classes.link}
        >
          Facebook
        </Link>
        , and{' '}
        <Link
          to={twitterPageURL}
          target="_blank"
          rel="noopener noreferrer"
          className={classes.link}
        >
          Twitter
        </Link>
        .
      </Typography>
    </>
  )
  const addendumContentFriday = (
    <>
      <div className={classes.hashtag}>
        <Typography variant="subtitle2" className={classes.hashtagText}>
          #FriendFriday
        </Typography>
      </div>
      <Typography variant="body2" gutterBottom>
        <span style={{ fontWeight: 'bold' }}>What you can do today: </span>
        we are proud to support nine amazing nonprofit partners who turn our
        tabs into concrete impact. Check out what these partners have to say
        about Tab for a Cause on{' '}
        <Link
          to={instagramPageURL}
          target="_blank"
          rel="noopener noreferrer"
          className={classes.link}
        >
          Instagram
        </Link>
        ,{' '}
        <Link
          to={facebookPageURL}
          target="_blank"
          rel="noopener noreferrer"
          className={classes.link}
        >
          Facebook
        </Link>
        , and{' '}
        <Link
          to={twitterPageURL}
          target="_blank"
          rel="noopener noreferrer"
          className={classes.link}
        >
          Twitter
        </Link>
        .
      </Typography>
    </>
  )
  const addendumContentWeekend = defaultAddendumContent

  let title = defaultTitle
  let mainContent = defaultMainContent
  let addendumContent = defaultAddendumContent
  switch (currentDateString) {
    case DAY_2020_11_02: {
      addendumContent = addendumContentMonday
      break
    }
    case DAY_2020_11_03: {
      addendumContent = addendumContentTuesday
      break
    }
    case DAY_2020_11_04: {
      addendumContent = addendumContentWednesday
      break
    }
    case DAY_2020_11_05: {
      addendumContent = addendumContentThursday
      break
    }
    case DAY_2020_11_06: {
      addendumContent = addendumContentFriday
      break
    }
    case DAY_2020_11_07: {
      addendumContent = addendumContentWeekend
      break
    }
    case DAY_2020_11_08: {
      addendumContent = addendumContentWeekend
      break
    }
    case DAY_2020_11_09: {
      addendumContent = addendumContentMonday
      break
    }
    case DAY_2020_11_10: {
      addendumContent = addendumContentTuesday
      break
    }
    case DAY_2020_11_11: {
      addendumContent = addendumContentWednesday
      break
    }
    case DAY_2020_11_12: {
      addendumContent = addendumContentThursday
      break
    }
    case DAY_2020_11_13: {
      addendumContent = addendumContentFriday
      break
    }
    case DAY_2020_11_14: {
      addendumContent = addendumContentWeekend
      break
    }
    case DAY_2020_11_15: {
      addendumContent = addendumContentWeekend
      break
    }
    case DAY_2020_11_16: {
      addendumContent = addendumContentMonday
      break
    }
    case DAY_2020_11_17: {
      addendumContent = addendumContentTuesday
      break
    }
    case DAY_2020_11_18: {
      addendumContent = addendumContentWednesday
      break
    }
    // TODO: handle dates past 11/18/2020
    default: {
      title = defaultTitle
      mainContent = defaultMainContent
      addendumContent = defaultAddendumContent
    }
  }

  return {
    title,
    mainContent,
    addendumContent,
  }
}

const MillionRaisedCampaign = ({
  app,
  classes,
  currentDateString,
  onDismiss,
}) => {
  const { moneyRaisedUSDString } = useMoneyRaised({
    moneyRaised: app.moneyRaised,
    dollarsPerDayRate: app.dollarsPerDayRate,
  })
  const { title, mainContent, addendumContent } = getCampaignContent({
    app,
    classes,
    currentDateString,
    moneyRaisedUSDString,
  })
  return (
    <div className={classes.root}>
      <Paper elevation={1} className={classes.paper}>
        <Paper elevation={1} className={classes.paper}>
          <div className={classes.borderTop} />
          <IconButton
            onClick={() => {
              setCampaignDismissTime()
              onDismiss()
            }}
            className={classes.closeButton}
          >
            <CloseIcon />
          </IconButton>
          <div className={classes.campaignContent}>
            <div className={classes.mainTextContainer}>
              <div className={classes.title}>{title}</div>
              <div>{mainContent}</div>
            </div>
          </div>
        </Paper>
        <div className={classes.campaignAddendum}>{addendumContent}</div>
      </Paper>
    </div>
  )
}

MillionRaisedCampaign.propTypes = {
  app: PropTypes.shape({}).isRequired,
  currentDateString: PropTypes.string.isRequired,
  onDismiss: PropTypes.func.isRequired,
}
MillionRaisedCampaign.defaultProps = {
  onDismiss: () => {},
}

export default withStyles(styles, { withTheme: true })(MillionRaisedCampaign)
