export const DRAG_HAPPENED = "DRAG_HAPPENED";

export const COL_DROPPABLEID_PREFIX = "column_number_";
export const TAGCARD_DRAGGABLEID_PREFIX = "tag_number_";
export const TAGCARD_DRAGGABLEID_TOKEN_INBETWEEN = "@$$";

export function extractTagtypeID_fromColDroppableID(droppableID){
    return droppableID.replace(COL_DROPPABLEID_PREFIX, "");
}

export function extractTagInfo_fromTagCardDraggableID(draggableID){
    const tokens = draggableID.split(TAGCARD_DRAGGABLEID_PREFIX + "|" + TAGCARD_DRAGGABLEID_TOKEN_INBETWEEN);
    return tokens;
}