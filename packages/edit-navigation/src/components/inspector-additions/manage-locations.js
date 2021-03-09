/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { useContext } from '@wordpress/element';
import {
	Spinner,
	SelectControl,
	CheckboxControl,
	Button,
	Modal,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { useMenuLocations, MenuIdContext } from '../../hooks';

export default function ManageLocations( {
	onSelectMenu,
	isModalOpen,
	openModal,
	closeModal,
} ) {
	const menus = useSelect( ( select ) => select( 'core' ).getMenus(), [] );

	const selectedMenuId = useContext( MenuIdContext );

	const {
		menuLocations,
		assignMenuToLocation,
		toggleMenuLocationAssignment,
	} = useMenuLocations();

	const themeLocationCountTextMain = sprintf(
		// translators: Number of available theme locations.
		__(
			'Your current theme provides with %d different locations to place menu.'
		),
		menuLocations.length
	);

	const themeLocationCountTextModal = sprintf(
		// translators: Number of available theme locations.
		__(
			'Your current theme provides with %d different locations. Select which menu appears in each location.'
		),
		menuLocations.length
	);

	const menusWithSelection = menuLocations.map( ( { name, menu } ) => {
		const menuOnLocation = menus
			.filter( ( { id } ) => ! [ 0, selectedMenuId ].includes( id ) )
			.find( ( { id } ) => id === menu );

		return (
			<CheckboxControl
				key={ name }
				checked={ menu === selectedMenuId }
				onChange={ () =>
					toggleMenuLocationAssignment( name, selectedMenuId )
				}
				label={ name }
				help={
					menuOnLocation &&
					sprintf(
						// translators: menu name.
						__( 'Currently using %s' ),
						menuOnLocation.name
					)
				}
			/>
		);
	} );

	if ( ! menus || ! menuLocations ) {
		return <Spinner />;
	}

	if ( ! menuLocations.length ) {
		return <p>{ __( 'There are no available menu locations.' ) }</p>;
	}

	const menuLocationCard = menuLocations.map( ( menuLocation ) => (
		<div
			key={ menuLocation.name }
			className="edit-navigation-manage-locations__menu-entry"
		>
			<SelectControl
				key={ menuLocation.name }
				className="edit-navigation-manage-locations__select-menu"
				label={ menuLocation.description }
				labelPosition="top"
				value={ menuLocation.menu }
				options={ [
					{ value: 0, label: __( '-' ), key: 0 },
					...menus.map( ( { id, name } ) => ( {
						key: id,
						value: id,
						label: name,
					} ) ),
				] }
				onChange={ ( menuId ) => {
					assignMenuToLocation( menuLocation.name, Number( menuId ) );
				} }
			/>
			<Button
				isSecondary
				style={ {
					visibility: !! menuLocation.menu ? 'visible' : 'hidden',
				} }
				className="edit-navigation-manage-locations__edit-button"
				onClick={ () => onSelectMenu( menuLocation.menu ) }
			>
				{ __( 'Edit' ) }
			</Button>
		</div>
	) );

	return (
		<>
			<div className="edit-navigation-manage-locations__theme-location-text-main">
				{ themeLocationCountTextMain }
			</div>
			{ menusWithSelection }
			<Button
				isSecondary
				className="edit-navigation-manage-locations__open-menu-locations-modal-button"
				aria-expanded={ isModalOpen }
				onClick={ openModal }
			>
				{ __( 'Manage locations' ) }
			</Button>
			{ isModalOpen && (
				<Modal
					title={ __( 'Manage Locations' ) }
					onRequestClose={ closeModal }
				>
					<div className="edit-navigation-manage-locations__theme-location-text-modal">
						{ themeLocationCountTextModal }
					</div>
					{ menuLocationCard }
				</Modal>
			) }
		</>
	);
}
