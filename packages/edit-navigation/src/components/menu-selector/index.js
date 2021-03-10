/**
 * WordPress dependencies
 */
import {
	MenuGroup,
	MenuItemsChoice,
	NavigableMenu,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function MenuSelector( { onSelectMenu, menus } ) {
	return (
		<>
			<h3 className="edit-navigation-menu-selector__header">
				{ __( 'Choose a menu to edit: ' ) }
			</h3>
			<NavigableMenu className="edit-navigation-menu-selector__body">
				<MenuGroup>
					<MenuItemsChoice
						onSelect={ onSelectMenu }
						choices={ menus.map( ( { id, name } ) => ( {
							value: id,
							label: name,
						} ) ) }
					/>
				</MenuGroup>
			</NavigableMenu>
		</>
	);
}
