import React, { Component } from 'react';
import PropTypes from 'prop-types';
import IoGearA from 'react-icons/lib/io/gear-a';
import IoToggle from 'react-icons/lib/io/toggle';
import IoToggleFilled from 'react-icons/lib/io/toggle-filled';
import IoCheckmarkCircled from 'react-icons/lib/io/checkmark-circled';
import { LastFm, Length, TimePeriod } from '../';
import { PlaylistDetail, PlaylistInfo, PlaylistTitle, Button, Toggle, ButtonDescription } from './Styles';

export default class Playlist extends Component {
  static propTypes = {
    enabled: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    toggle: PropTypes.func.isRequired,
    saveSettings: PropTypes.func.isRequired,
    length: PropTypes.number,
    lastfm: PropTypes.string,
    period: PropTypes.string
  }

  static defaultProps = {
    length: 10,
    lastfm: undefined,
    period: undefined
  }

  state = {
    showMore: false,
    length: null,
    lastfm: null,
    period: null
  }

  componentDidMount = () => this.updateState(this.props)
  componentWillReceiveProps = (nextProps) => this.updateState(nextProps)

  updateState = (nextProps) => {
    const { length, lastfm, period } = nextProps;
    const safeVals = {
      length: length || 10,
      lastfm: lastfm === undefined ? undefined : lastfm || '',
      period: period === undefined ? undefined : period || '3month'
    };
    safeVals.length = safeVals.length > 50
      ? 50
      : safeVals.length < 1
      ? 1
      : safeVals.length;
    this.setState({ ...safeVals });
  }

  updateLength = e => this.setState({ length: e.target.value > 50 ? 50 : e.target.value < 1 ? 1 : e.target.value })
  updateLastfm = e => this.setState({ lastfm: e.target.value })
  updatePeriod = e => this.setState({ period: e.target.value })

  toggleSettings = () => {
    if (this.form && !this.form.checkValidity()) return;
    const { state: { showMore, length, lastfm, period }, props: { saveSettings } } = this;
    if (showMore) saveSettings({ length, lastfm, period });
    this.setState((prevState) => ({ showMore: !prevState.showMore }));
  }

  // react 16 array returns are cool
  render = () => {
    const {
      props: { enabled, title, toggle },
      state: { showMore, length, lastfm, period },
      updateLength,
      updateLastfm,
      updatePeriod,
      toggleSettings
    } = this;
    return [
      <PlaylistInfo on={enabled} key={title}>
        <PlaylistTitle>{title}</PlaylistTitle>
        <Button title={`Turn ${enabled ? 'Off' : 'On'}`} onClick={toggle} on={enabled}>
          { enabled ? <Toggle><IoToggleFilled /></Toggle> : <Toggle><IoToggle /></Toggle>}
          <ButtonDescription> {`Turn ${enabled ? 'Off' : 'On'}`} </ButtonDescription>
        </Button>
        <Button onClick={toggleSettings} settings >
          { showMore ? <IoCheckmarkCircled /> : <IoGearA /> }
          <ButtonDescription>{showMore ? 'Save' : 'Edit'}</ButtonDescription>
        </Button>
      </PlaylistInfo>,
      showMore
      ? <PlaylistDetail key={`${title}-detail`}>
        <form ref={PlaylistDetail => this.form = PlaylistDetail}>
          <Length length={length} onChange={updateLength} />
          { lastfm !== undefined ? <LastFm lastfm={lastfm || ''} onChange={updateLastfm} /> : null}
          { period !== undefined ? <TimePeriod period={period || '3month'} onChange={updatePeriod} /> : null}
        </form>
      </PlaylistDetail>
      : null
    ]
  }
}