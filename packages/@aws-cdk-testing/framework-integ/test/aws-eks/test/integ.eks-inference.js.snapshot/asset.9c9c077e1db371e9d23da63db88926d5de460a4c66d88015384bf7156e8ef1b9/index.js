"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const diff_1 = require("./diff");
const external_1 = require("./external");
async function handler(event) {
    if (event.RequestType === 'Create') {
        return onCreate(event);
    }
    if (event.RequestType === 'Update') {
        return onUpdate(event);
    }
    if (event.RequestType === 'Delete') {
        return onDelete(event);
    }
    throw new Error('invalid request type');
}
exports.handler = handler;
async function onCreate(event) {
    const issuerUrl = event.ResourceProperties.Url;
    const thumbprints = (event.ResourceProperties.ThumbprintList ?? []).sort(); // keep sorted for UPDATE
    const clients = (event.ResourceProperties.ClientIDList ?? []).sort();
    if (thumbprints.length === 0) {
        thumbprints.push(await external_1.external.downloadThumbprint(issuerUrl));
    }
    const resp = await external_1.external.createOpenIDConnectProvider({
        Url: issuerUrl,
        ClientIDList: clients,
        ThumbprintList: thumbprints,
    });
    return {
        PhysicalResourceId: resp.OpenIDConnectProviderArn,
        Data: {
            Thumbprints: JSON.stringify(thumbprints),
        },
    };
}
async function onUpdate(event) {
    const issuerUrl = event.ResourceProperties.Url;
    const thumbprints = (event.ResourceProperties.ThumbprintList ?? []).sort(); // keep sorted for UPDATE
    const clients = (event.ResourceProperties.ClientIDList ?? []).sort();
    // determine which update we are talking about.
    const oldIssuerUrl = event.OldResourceProperties.Url;
    // if this is a URL update, then we basically create a new resource and cfn will delete the old one
    // since the physical resource ID will change.
    if (oldIssuerUrl !== issuerUrl) {
        return onCreate({ ...event, RequestType: 'Create' });
    }
    const providerArn = event.PhysicalResourceId;
    if (thumbprints.length === 0) {
        thumbprints.push(await external_1.external.downloadThumbprint(issuerUrl));
    }
    external_1.external.log('updating thumbprint to', thumbprints);
    await external_1.external.updateOpenIDConnectProviderThumbprint({
        OpenIDConnectProviderArn: providerArn,
        ThumbprintList: thumbprints,
    });
    // if client ID list has changed, determine "diff" because the API is add/remove
    const oldClients = (event.OldResourceProperties.ClientIDList || []).sort();
    const diff = (0, diff_1.arrayDiff)(oldClients, clients);
    external_1.external.log(`client ID diff: ${JSON.stringify(diff)}`);
    for (const addClient of diff.adds) {
        external_1.external.log(`adding client id "${addClient}" to provider ${providerArn}`);
        await external_1.external.addClientIDToOpenIDConnectProvider({
            OpenIDConnectProviderArn: providerArn,
            ClientID: addClient,
        });
    }
    for (const deleteClient of diff.deletes) {
        external_1.external.log(`removing client id "${deleteClient}" from provider ${providerArn}`);
        await external_1.external.removeClientIDFromOpenIDConnectProvider({
            OpenIDConnectProviderArn: providerArn,
            ClientID: deleteClient,
        });
    }
    return {
        Data: {
            Thumbprints: JSON.stringify(thumbprints),
        },
    };
}
async function onDelete(deleteEvent) {
    await external_1.external.deleteOpenIDConnectProvider({
        OpenIDConnectProviderArn: deleteEvent.PhysicalResourceId,
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpQ0FBbUM7QUFDbkMseUNBQXNDO0FBRS9CLEtBQUssVUFBVSxPQUFPLENBQUMsS0FBa0Q7SUFDOUUsSUFBSSxLQUFLLENBQUMsV0FBVyxLQUFLLFFBQVEsRUFBRTtRQUFFLE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQUU7SUFDL0QsSUFBSSxLQUFLLENBQUMsV0FBVyxLQUFLLFFBQVEsRUFBRTtRQUFFLE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQUU7SUFDL0QsSUFBSSxLQUFLLENBQUMsV0FBVyxLQUFLLFFBQVEsRUFBRTtRQUFFLE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQUU7SUFDL0QsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBQzFDLENBQUM7QUFMRCwwQkFLQztBQUVELEtBQUssVUFBVSxRQUFRLENBQUMsS0FBd0Q7SUFDOUUsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQztJQUMvQyxNQUFNLFdBQVcsR0FBYSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyx5QkFBeUI7SUFDL0csTUFBTSxPQUFPLEdBQWEsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBRS9FLElBQUksV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDNUIsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLG1CQUFRLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztLQUNoRTtJQUVELE1BQU0sSUFBSSxHQUFHLE1BQU0sbUJBQVEsQ0FBQywyQkFBMkIsQ0FB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QUFDLDJCQUEyQixDQUFDO1FBQ3pDLHdCQUF3QixFQUFFLFdBQVcsQ0FBQyxrQkFBa0I7S0FDekQsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGFycmF5RGlmZiB9IGZyb20gJy4vZGlmZic7XG5pbXBvcnQgeyBleHRlcm5hbCB9IGZyb20gJy4vZXh0ZXJuYWwnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihldmVudDogQVdTTGFtYmRhLkNsb3VkRm9ybWF0aW9uQ3VzdG9tUmVzb3VyY2VFdmVudCkge1xuICBpZiAoZXZlbnQuUmVxdWVzdFR5cGUgPT09ICdDcmVhdGUnKSB7IHJldHVybiBvbkNyZWF0ZShldmVudCk7IH1cbiAgaWYgKGV2ZW50LlJlcXVlc3RUeXBlID09PSAnVXBkYXRlJykgeyByZXR1cm4gb25VcGRhdGUoZXZlbnQpOyB9XG4gIGlmIChldmVudC5SZXF1ZXN0VHlwZSA9PT0gJ0RlbGV0ZScpIHsgcmV0dXJuIG9uRGVsZXRlKGV2ZW50KTsgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgcmVxdWVzdCB0eXBlJyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIG9uQ3JlYXRlKGV2ZW50OiBBV1NMYW1iZGEuQ2xvdWRGb3JtYXRpb25DdXN0b21SZXNvdXJjZUNyZWF0ZUV2ZW50KSB7XG4gIGNvbnN0IGlzc3VlclVybCA9IGV2ZW50LlJlc291cmNlUHJvcGVydGllcy5Vcmw7XG4gIGNvbnN0IHRodW1icHJpbnRzOiBzdHJpbmdbXSA9IChldmVudC5SZXNvdXJjZVByb3BlcnRpZXMuVGh1bWJwcmludExpc3QgPz8gW10pLnNvcnQoKTsgLy8ga2VlcCBzb3J0ZWQgZm9yIFVQREFURVxuICBjb25zdCBjbGllbnRzOiBzdHJpbmdbXSA9IChldmVudC5SZXNvdXJjZVByb3BlcnRpZXMuQ2xpZW50SURMaXN0ID8/IFtdKS5zb3J0KCk7XG5cbiAgaWYgKHRodW1icHJpbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHRodW1icHJpbnRzLnB1c2goYXdhaXQgZXh0ZXJuYWwuZG93bmxvYWRUaHVtYnByaW50KGlzc3VlclVybCkpO1xuICB9XG5cbiAgY29uc3QgcmVzcCA9IGF3YWl0IGV4dGVybmFsLmNyZWF0ZU9wZW5JRENvbm5lY3RQcm92aWRlcih7XG4gICAgVXJsOiBpc3N1ZXJVcmwsXG4gICAgQ2xpZW50SURMaXN0OiBjbGllbnRzLFxuICAgIFRodW1icHJpbnRMaXN0OiB0aHVtYnByaW50cyxcbiAgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICBQaHlzaWNhbFJlc291cmNlSWQ6IHJlc3AuT3BlbklEQ29ubmVjdFByb3ZpZGVyQXJuLFxuICAgIERhdGE6IHtcbiAgICAgIFRodW1icHJpbnRzOiBKU09OLnN0cmluZ2lmeSh0aHVtYnByaW50cyksXG4gICAgfSxcbiAgfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gb25VcGRhdGUoZXZlbnQ6IEFXU0xhbWJkYS5DbG91ZEZvcm1hdGlvbkN1c3RvbVJlc291cmNlVXBkYXRlRXZlbnQpIHtcbiAgY29uc3QgaXNzdWVyVXJsID0gZXZlbnQuUmVzb3VyY2VQcm9wZXJ0aWVzLlVybDtcbiAgY29uc3QgdGh1bWJwcmludHM6IHN0cmluZ1tdID0gKGV2ZW50LlJlc291cmNlUHJvcGVydGllcy5UaHVtYnByaW50TGlzdCA/PyBbXSkuc29ydCgpOyAvLyBrZWVwIHNvcnRlZCBmb3IgVVBEQVRFXG4gIGNvbnN0IGNsaWVudHM6IHN0cmluZ1tdID0gKGV2ZW50LlJlc291cmNlUHJvcGVydGllcy5DbGllbnRJRExpc3QgPz8gW10pLnNvcnQoKTtcblxuICAvLyBkZXRlcm1pbmUgd2hpY2ggdXBkYXRlIHdlIGFyZSB0YWxraW5nIGFib3V0LlxuICBjb25zdCBvbGRJc3N1ZXJVcmwgPSBldmVudC5PbGRSZXNvdXJjZVByb3BlcnRpZXMuVXJsO1xuXG4gIC8vIGlmIHRoaXMgaXMgYSBVUkwgdXBkYXRlLCB0aGVuIHdlIGJhc2ljYWxseSBjcmVhdGUgYSBuZXcgcmVzb3VyY2UgYW5kIGNmbiB3aWxsIGRlbGV0ZSB0aGUgb2xkIG9uZVxuICAvLyBzaW5jZSB0aGUgcGh5c2ljYWwgcmVzb3VyY2UgSUQgd2lsbCBjaGFuZ2UuXG4gIGlmIChvbGRJc3N1ZXJVcmwgIT09IGlzc3VlclVybCkge1xuICAgIHJldHVybiBvbkNyZWF0ZSh7IC4uLmV2ZW50LCBSZXF1ZXN0VHlwZTogJ0NyZWF0ZScgfSk7XG4gIH1cblxuICBjb25zdCBwcm92aWRlckFybiA9IGV2ZW50LlBoeXNpY2FsUmVzb3VyY2VJZDtcblxuICBpZiAodGh1bWJwcmludHMubGVuZ3RoID09PSAwKSB7XG4gICAgdGh1bWJwcmludHMucHVzaChhd2FpdCBleHRlcm5hbC5kb3dubG9hZFRodW1icHJpbnQoaXNzdWVyVXJsKSk7XG4gIH1cblxuICBleHRlcm5hbC5sb2coJ3VwZGF0aW5nIHRodW1icHJpbnQgdG8nLCB0aHVtYnByaW50cyk7XG4gIGF3YWl0IGV4dGVybmFsLnVwZGF0ZU9wZW5JRENvbm5lY3RQcm92aWRlclRodW1icHJpbnQoe1xuICAgIE9wZW5JRENvbm5lY3RQcm92aWRlckFybjogcHJvdmlkZXJBcm4sXG4gICAgVGh1bWJwcmludExpc3Q6IHRodW1icHJpbnRzLFxuICB9KTtcblxuICAvLyBpZiBjbGllbnQgSUQgbGlzdCBoYXMgY2hhbmdlZCwgZGV0ZXJtaW5lIFwiZGlmZlwiIGJlY2F1c2UgdGhlIEFQSSBpcyBhZGQvcmVtb3ZlXG4gIGNvbnN0IG9sZENsaWVudHM6IHN0cmluZ1tdID0gKGV2ZW50Lk9sZFJlc291cmNlUHJvcGVydGllcy5DbGllbnRJRExpc3QgfHwgW10pLnNvcnQoKTtcbiAgY29uc3QgZGlmZiA9IGFycmF5RGlmZihvbGRDbGllbnRzLCBjbGllbnRzKTtcbiAgZXh0ZXJuYWwubG9nKGBjbGllbnQgSUQgZGlmZjogJHtKU09OLnN0cmluZ2lmeShkaWZmKX1gKTtcblxuICBmb3IgKGNvbnN0IGFkZENsaWVudCBvZiBkaWZmLmFkZHMpIHtcbiAgICBleHRlcm5hbC5sb2coYGFkZGluZyBjbGllbnQgaWQgXCIke2FkZENsaWVudH1cIiB0byBwcm92aWRlciAke3Byb3ZpZGVyQXJufWApO1xuICAgIGF3YWl0IGV4dGVybmFsLmFkZENsaWVudElEVG9PcGVuSURDb25uZWN0UHJvdmlkZXIoe1xuICAgICAgT3BlbklEQ29ubmVjdFByb3ZpZGVyQXJuOiBwcm92aWRlckFybixcbiAgICAgIENsaWVudElEOiBhZGRDbGllbnQsXG4gICAgfSk7XG4gIH1cblxuICBmb3IgKGNvbnN0IGRlbGV0ZUNsaWVudCBvZiBkaWZmLmRlbGV0ZXMpIHtcbiAgICBleHRlcm5hbC5sb2coYHJlbW92aW5nIGNsaWVudCBpZCBcIiR7ZGVsZXRlQ2xpZW50fVwiIGZyb20gcHJvdmlkZXIgJHtwcm92aWRlckFybn1gKTtcbiAgICBhd2FpdCBleHRlcm5hbC5yZW1vdmVDbGllbnRJREZyb21PcGVuSURDb25uZWN0UHJvdmlkZXIoe1xuICAgICAgT3BlbklEQ29ubmVjdFByb3ZpZGVyQXJuOiBwcm92aWRlckFybixcbiAgICAgIENsaWVudElEOiBkZWxldGVDbGllbnQsXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIERhdGE6IHtcbiAgICAgIFRodW1icHJpbnRzOiBKU09OLnN0cmluZ2lmeSh0aHVtYnByaW50cyksXG4gICAgfSxcbiAgfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gb25EZWxldGUoZGVsZXRlRXZlbnQ6IEFXU0xhbWJkYS5DbG91ZEZvcm1hdGlvbkN1c3RvbVJlc291cmNlRGVsZXRlRXZlbnQpIHtcbiAgYXdhaXQgZXh0ZXJuYWwuZGVsZXRlT3BlbklEQ29ubmVjdFByb3ZpZGVyKHtcbiAgICBPcGVuSURDb25uZWN0UHJvdmlkZXJBcm46IGRlbGV0ZUV2ZW50LlBoeXNpY2FsUmVzb3VyY2VJZCxcbiAgfSk7XG59XG4iXX0=