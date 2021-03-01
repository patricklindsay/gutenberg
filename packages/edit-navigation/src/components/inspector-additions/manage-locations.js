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
	PanelBody,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

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
		toggleMenuToLocation,
	} = useMenuLocations();
	const menusWithSelection = menuLocations.map( ( themeLocation ) => (
		<CheckboxControl
			key={ themeLocation.name }
			checked={ themeLocation.menu === selectedMenuId }
			onChange={ () =>
				toggleMenuToLocation( themeLocation.name, selectedMenuId )
			}
			label={ themeLocation.name }
		/>
	) );
	if ( ! menus || ! menuLocations ) {
		return <Spinner />;
	}

	if ( ! menus.length ) {
		return <p>{ __( 'There are no available menus.' ) }</p>;
	}

	if ( ! menuLocations.length ) {
		return <p>{ __( 'There are no available menu locations.' ) }</p>;
	}

	const menuLocationCard = menuLocations.map( ( menuLocation ) => (
		<div
			key={ menuLocation.name }
			className="edit-navigation-header__manage-locations__menage-locations-modal__menu-entry"
		>
			<SelectControl
				key={ menuLocation.name }
				className="edit-navigation-header__manage-locations__menage-locations-modal__select-menu"
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
				isTertiary
				className="edit-navigation-header__manage-locations__menage-locations-modal__edit-button"
				onClick={ () => onSelectMenu( menuLocation.menu ) }
			>
				{ __( 'Edit' ) }
			</Button>
		</div>
	) );

	return (
		<>
			<PanelBody>
				{ menusWithSelection }
				<Button
					isPrimary
					className="edit-navigation-header__manage-locations__open-manage-locations-modal-button"
					aria-expanded={ isModalOpen }
					onClick={ openModal }
				>
					{ __( 'Manage locations' ) }
				</Button>
			</PanelBody>
			{ isModalOpen && (
				<Modal
					title={ __( 'Manage Locations' ) }
					onRequestClose={ closeModal }
				>
					<div>
						{ __( `Number of available theme locations:` ) +
							' ' +
							menuLocations.length }
					</div>
					<div>
						{ __( `Select which menu appears in each location.` ) }
					</div>
					{ menuLocationCard }
					<Button isSecondary onClick={ closeModal }>
						Close Modal
					</Button>
				</Modal>
			) }
		</>
	);
}
