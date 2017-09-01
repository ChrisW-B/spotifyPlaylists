import React, { Component } from 'react';
import PropTypes from 'prop-types';
import IoGearA from 'react-icons/lib/io/gear-a';
import IoToggle from 'react-icons/lib/io/toggle';
import IoToggleFilled from 'react-icons/lib/io/toggle-filled';
import IoCheckmarkCircled from 'react-icons/lib/io/checkmark-circled';
import { LastFm, Length, TimePeriod } from '../';
import { PlaylistWrapper, PlaylistInfo, PlaylistTitle, Button, Toggle } from './Styles';

class Playlist extends Component {

  static propTypes = {
    enabled: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    toggle: PropTypes.func.isRequired,
    saveSettings: PropTypes.func.isRequired,
    length: PropTypes.string,
    lastfm: PropTypes.string,
    period: PropTypes.string
  }

  state = {
    showMore: false,
    length: null,
    lastfm: null,
    period: null
  }

  componentDidMount = () => this.updateState(this.props)
  componentWillReceiveProps = (nextProps) => this.updateState(nextProps)

  updateState = (n) => {
    const { length, lastfm, period } = n;
    const safeVals = {
      length: length || 10,
      lastfm: lastfm === undefined ? undefined : lastfm ? lastfm : '',
      period: period === undefined ? undefined : period ? period : '3month'
    };
    this.setState({ ...safeVals });
  }

  updateLength = (e) => this.setState({ length: e.target.value })
  updateLastfm = (e) => this.setState({ lastfm: e.target.value })
  updatePeriod = (e) => this.setState({ period: e.target.value })

  toggleSettings = (e) => {
    const { state: { showMore, length, lastfm, period }, props: { saveSettings } } = this;
    if (showMore) saveSettings({ length, lastfm, period });
    this.setState((prevState) => ({ showMore: !prevState.showMore }));
  }

  render = () => {
    const {
      props: { enabled, title, toggle },
      state: { showMore, length, lastfm, period },
      updateLength,
      updateLastfm,
      updatePeriod,
      toggleSettings
    } = this;
    return (
      <PlaylistWrapper>
        <PlaylistInfo on={enabled}>
          <PlaylistTitle>{title}</PlaylistTitle>
          <Button onClick={toggle} on={enabled}>
            {
              enabled
              ? <Toggle><IoToggleFilled/></Toggle>
              : <Toggle><IoToggle/></Toggle>
            }
          </Button>
          {
            showMore
            ? <Button onClick={toggleSettings} settings><IoCheckmarkCircled/></Button>
            : <Button onClick={toggleSettings} settings><IoGearA/></Button>
          }
        </PlaylistInfo>
        {
          showMore
          ? <div>
              <Length length={length} onChange={updateLength} />
              { lastfm !== undefined ? <LastFm lastfm={lastfm || ''} onChange={updateLastfm}/> : null}
              { period !== undefined ? <TimePeriod period={period || '3month' } onChange={updatePeriod} /> : null}
            </div>
          : null
        }

      </PlaylistWrapper>
    );
  }
}

export default Playlist;