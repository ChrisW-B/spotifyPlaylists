$(document).ready(() => {
	listUserPlaylists();
});

const listUserPlaylists = () => {
	const listSection = $('.enabledplaylists');
	$.ajax({
		url: '/userplaylists'
	}).done(function(data) {
		if (!data.error) {
			const recent = createListItem(String(data.recentlyAdded).toLowerCase() === 'true', 'Recently Added'),
				most = createListItem(String(data.mostPlayed).toLowerCase() === 'true', 'Most Played');
			listSection.append(recent, most);
		} else {
			listUserPlaylists();
		}
	});
};

const createListItem = (isEnabled, name) => {
	const ele = $(`<li href="#" 
						class="list-group-item list-group-item-${isEnabled ? 'success' : 'danger'}">
						${name}
					</li>`),
		toggle = $(`<a href="/enable?type=${name}" class="list-group-button list-group-item-${isEnabled ? 'danger' : 'success'}">
					<div class="glyphicon glyphicon-${isEnabled ? 'minus' : 'plus'}-sign"></div>
				</a>`),
		settings = $(`<a href="/settings?type=${name}" class="list-group-button list-group-item-warning">
					<div class="glyphicon glyphicon-cog"></div>
				</a>`);

	ele.append(toggle);
	if (isEnabled) ele.append(settings);
	return ele;
};