function showEditVNF(data) {
    if (data.justCreated)
        showEditNewVNF(data);
    else
        showEditExistingVNF(data);
}