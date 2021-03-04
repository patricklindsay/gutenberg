/**
 * WordPress dependencies
 */
import { useMemo } from '@wordpress/element';
import {
	BlockEditorProvider,
	BlockList,
	BlockSelectionClearer,
	ObserveTyping,
	WritingFlow,
} from '@wordpress/block-editor';
import { DropZoneProvider, SlotFillProvider } from '@wordpress/components';

/**
 * External dependencies
 */
import { useDialogState } from 'reakit/Dialog';

/**
 * Internal dependencies
 */
import Header from '../header';
import useSidebarBlockEditor from './use-sidebar-block-editor';

export default function SidebarBlockEditor( { sidebar } ) {
	const [ blocks, onInput, onChange ] = useSidebarBlockEditor( sidebar );
	const inserter = useDialogState( {
		modal: false,
		animated: 150,
	} );
	const settings = useMemo(
		() => ( {
			__experimentalSetIsInserterOpened: inserter.setVisible,
		} ),
		[ inserter.setVisible ]
	);

	return (
		<SlotFillProvider>
			<DropZoneProvider>
				<BlockEditorProvider
					value={ blocks }
					onInput={ onInput }
					onChange={ onChange }
					settings={ settings }
				>
					<Header inserter={ inserter } />

					<BlockSelectionClearer>
						<WritingFlow>
							<ObserveTyping>
								<BlockList />
							</ObserveTyping>
						</WritingFlow>
					</BlockSelectionClearer>
				</BlockEditorProvider>
			</DropZoneProvider>
		</SlotFillProvider>
	);
}
