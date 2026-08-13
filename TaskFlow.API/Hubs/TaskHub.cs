using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;

namespace TaskFlow.API.Hubs;

public class TaskHub : Hub
{
    private static readonly ConcurrentDictionary<string, int> ActiveUsers = new();

    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;

        if (!string.IsNullOrWhiteSpace(userId))
        {
            ActiveUsers.AddOrUpdate(
                userId,
                1,
                (_, connectionCount) => connectionCount + 1
            );

            await Clients.All.SendAsync(
                "ActiveUsersChanged",
                ActiveUsers.Keys.ToList()
            );
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier;

        if (!string.IsNullOrWhiteSpace(userId))
        {
            ActiveUsers.AddOrUpdate(
                userId,
                0,
                (_, connectionCount) => connectionCount - 1
            );

            if (ActiveUsers.TryGetValue(userId, out var connectionCount) &&
                connectionCount <= 0)
            {
                ActiveUsers.TryRemove(userId, out _);
            }

            await Clients.All.SendAsync(
                "ActiveUsersChanged",
                ActiveUsers.Keys.ToList()
            );
        }

        await base.OnDisconnectedAsync(exception);
    }
}