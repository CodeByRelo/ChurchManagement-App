using ChurchManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChurchManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles =
    "Super Administrator,Church Administrator,Ministry Leader")]
public class DashboardController : ControllerBase
{
    private readonly DashboardService _dashboardService;

    public DashboardController(
        DashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    // GET: api/Dashboard
    [HttpGet]
    public async Task<IActionResult> GetDashboard()
    {
        var dashboard =
            await _dashboardService.GetDashboardAsync();

        return Ok(dashboard);
    }
}