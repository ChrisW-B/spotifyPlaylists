class Playlists extends React.Component {
	constructor() {
		super();
		this.state = {
			data: [],
			most: Math.random(),
			recent: Math.random(),
			most_toggle: Math.random(),
			most_settings: Math.random(),
			recent_toggle: Math.random(),
			recent_settings: Math.random()
		};
	}
	render() {
		const most = this.createListItem(this.state.data.mostPlayed, 'Most Played', 'most');
		const recent = this.createListItem(this.state.data.recentlyAdded, 'Recently Added', 'recent');
		return <ul className='list-group'>{most}{recent}</ul>;
	}
	componentDidMount() {
		fetch('/userplaylists', {
			credentials: 'same-origin'
		}).then((result) => {
			return result.json();
		}).then(json => {
			if (!json.error) {
				this.setState({
					data: json
				});
			}
		});
	}
	createListItem(isEnabled, name, shortName) {
		const toggleClass = 'list-group-button list-group-item-' + (isEnabled ? 'danger' : 'success'),
		toggleGlyph = 'glyphicon glyphicon-' + (isEnabled ? 'remove-circle' : 'plus-sign'),
			toggleTitle = (isEnabled ? 'Turn Off' : 'Turn On'),
			itemClass = 'list-group-item list-group-item-' + (isEnabled ? 'success' : 'danger'),
			toggleKeyName = shortName + '_toggle',
			settingsKeyName = shortName + '_settings',
			toggle = <a href='#' onClick={() => this.toggleElement(shortName)} className={toggleClass} title={toggleTitle} key={this.state[toggleKeyName]}>
						<div className={toggleGlyph}></div>
				   	</a>,
			settings = <a href={"/settings?type=" +shortName} className="list-group-button list-group-item-warning" title="Settings" key={this.state[settingsKeyName]}>
					<div className="glyphicon glyphicon-cog"></div>
				   </a>;
		const children = isEnabled ? [toggle, settings] : toggle;
		return <li href="#" className={itemClass} key={this.state[shortName]}>
				{children}
				{name}
			</li>;
	}
	toggleElement(name) {
		var self = this;
		fetch('/toggle?type=' + name, {
			credentials: 'same-origin'
		}).then((result) => {
			return result.json();
		}).then(json => {
			if (!json.isSetup) {
				window.location = "/settings?type=" + name;
			} else {
				if (name === 'most') {
					self.setState({
						most: Math.random(),
						most_toggle: Math.random(),
						most_settings: Math.random()
					});

				} else {
					self.setState({
						recent: Math.random(),
						recent_toggle: Math.random(),
						recent_settings: Math.random()
					});
				}
				self.componentDidMount()
			}
		});
	}
};


ReactDOM.render(
	<Playlists />,
	document.getElementById('playlists')
);